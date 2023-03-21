import express = require("express")
import { Express, Request, Response } from "express"
import { promises as fs } from "fs"
import fs2 = require("fs")
import path = require("path")
import mime = require("mime")
import { fromSus } from "sonolus-pjsekai-engine"
import { gzipSync } from "zlib"
import syncGlob = require("glob")
import "@colors/colors"
import "ejs"
import * as fssync from "fs"
import * as os from "os"
import axios from "axios"
import lastModified from "recursive-last-modified"
import { ServerInfo } from "sonolus-core"
import { bgMagenta } from "@colors/colors"
import bcrypt = require("bcryptjs")
import { config } from "process"

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

const app = express()

const version = JSON.parse(fssync.readFileSync("package.json", "utf8"))[
  "version"
]
let engine = null

const HOME = process.env.USERPROFILE || process.env.HOME

// -- Config -------------------------------------------

const defaultConfig = {
  serverSettings: {
    serverTitle: "SonoLite Private Test Server",
    serverSkins: [],
    serverBackgrounds: [],
    serverParticles: [],
    serverEffects: [],
    serverEngines: [],
    serverBanners: ["https://cdn-etc.purplepalette.net/sp-banner.png",],
    selectedBannerIndex: 0,
  },
  port: 5010,
  downloadPath: "%USERPROFILE%/Downloads",
  passwordProtectionEnabled: false,
  password: "",
  fileLimits: {
    jacketLimit: 20,
    musicLimit: 50,
    dataLimit: 5,
  }
}

async function getConfig(key: string = undefined): Promise<any> {
  if (
    !(await fs
      .stat(HOME + "/SonoLite.json")
      .catch(() => false))
  ) {
    await fs.writeFile(
      HOME + "/SonoLite.json",
      JSON.stringify(defaultConfig)
    )
  }
  const text = await fs.readFile(
    HOME + "/SonoLite.json",
    "utf8"
  )
  const json = JSON.parse(text)
  if (key === undefined) return json
  return json[key] || defaultConfig[key]
}

async function setConfig(data: any = undefined) {
  try {
    const text = await fs.readFile(
      HOME + "/SonoLite.json",
      "utf8"
    )

    const json = JSON.parse(text)
    if (data === undefined) {
      return await fs.writeFile(
        HOME + "/SonoLite.json",
        JSON.stringify({
          ...defaultConfig,
          ...json,
        })
      )
    } else {
      return await fs.writeFile(
        HOME + "/SonoLite.json",
        JSON.stringify({
          ...defaultConfig,
          ...json,
          ...data,
        })
      )
    }
  } catch {
    await fs.writeFile(
      HOME + "/SonoLite.json",
      JSON.stringify({
        ...defaultConfig,
        ...data,
      })
    )
    return
  }
}

let conf = null
try {
  conf = JSON.parse(fs2.readFileSync(HOME + "/SonoLite.json", "utf8"))
} catch {
  conf = defaultConfig
}
let limit = conf.fileLimits.jacketLimit + conf.fileLimits.musicLimit + conf.fileLimits.dataLimit + 1
app.use(express.json({ limit: `${limit}mb` }))
app.use(express.urlencoded({ limit: `${limit}mb` }))
app.use(express.json())

async function deleteDirectory(directory: string): Promise<void> {
  try {
    const files = await fs2.promises.readdir(directory)
    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = await fs2.promises.lstat(filePath)
      if (stats.isDirectory()) {
        await deleteDirectory(filePath)
      } else {
        await fs2.promises.unlink(filePath)
      }
    }
    await fs2.promises.rmdir(directory)
  } catch (err) {
    console.error(err)
  }
}

async function deleteScore(id) {
  try {
    deleteDirectory(`./levels/${id}`)
    return true
  } catch {
    return false
  }
  // fs.rm(`./levels/${id}`, {recursive: true, force: true})
}

async function editScore(data: any) {
  // fs.copyFile(`./levels/${data.title}/data.txt`, data.score)
  // streamMove(data.score, `./levels/${data.title}/data.txt`)
  try {
    await fs.access(`./levels/${data.id}`)
  } catch {
    printInfo(`./levels/${data.id} was not found.`)
    return false
  }
  try {
    await fs.writeFile(`./levels/${data.id}/metadata.json`, JSON.stringify({
      title: data.title,
      artists: data.artists,
      author: data.author,
      rating: data.difficulty,
      description: data.description,
      genre: data.genre,
    }))
    return true
  } catch {
    return false
  }
}

async function addScore(data: any) {
  // fs.copyFile(`./levels/${data.title}/data.txt`, data.score)
  // streamMove(data.score, `./levels/${data.title}/data.txt`)
  if (data.type === 'local') {
    try {
      await fs.access(`./levels/${data.id}`)
    } catch {
      printInfo(`./levels/${data.id} was not found, creating.`)
      await fs.mkdir(`./levels/${data.id}`)
      printInfo(`./levels/${data.id} created.`)
    }
    try {
      await fs.writeFile(`./levels/${data.id}/data.txt`, data.score)
      // streamMove(data.music, `./levels/${data.title}/bgm.mp3`)
      var musicdata = data.music.replace(/^data:audio\/\w+;base64,/, "")
      var musicbuf = Buffer.from(musicdata, 'base64')
      await fs.writeFile(`./levels/${data.id}/bgm.mp3`, musicbuf)
      const img = data.jacketPath
      await fs.writeFile('./levels/test.txt', data.music);
      var imgdata = data.jacket.replace(/^data:image\/\w+;base64,/, "")
      var imgbuf = Buffer.from(imgdata, 'base64')
      if (img.endsWith("png")) {
        // streamMove(img, `./levels/${data.title}/jacket.png`)
        await fs.writeFile(`./levels/${data.id}/jacket.png`, imgbuf)
      } else if (img.endsWith("jpg")) {
        // streamMove(img, `./levels/${data.title}/jacket.jpg`)
        await fs.writeFile(`./levels/${data.id}/jacket.jpg`, imgbuf)
      } else if (img.endsWith("jpeg")) {
        // streamMove(img, `./levels/${data.title}/jacket.jpeg`)
        await fs.writeFile(`./levels/${data.id}/jacket.jpeg`, imgbuf)
      }
      await fs.writeFile(`./levels/${data.id}/metadata.json`, JSON.stringify({
        title: data.title,
        artists: data.artists,
        author: data.author,
        rating: data.difficulty,
        description: data.description,
        genre: data.genre,
        type: 'local'
      }))
      return true
    } catch {
      return false
    }
  } else if (data.type === 'imported') {
    try {
      await fs.access(`./levels/${data.name}`)
    } catch {
      printInfo(`./levels/${data.name} was not found, creating.`)
      await fs.mkdir(`./levels/${data.name}`)
      printInfo(`./levels/${data.name} created.`)
    }
    try {
      await fs.writeFile(`./levels/${data.name}/metadata.json`, JSON.stringify({
        name: data.name,
        rating: data.rating,
        title: data.title,
        artists: data.artists,
        author: data.author,
        cover: data.cover,
        bgm: data.bgm,
        preview: data.preview,
        data: data.data,
        type: 'imported'
      }))
      return true;
    } catch {
      return false;
    }
  }
}

// -- Functions ----------------------------------------

function replaceSlash(path: string) {
  return path.replace(/\\/g, "/")
}

function parseEnv(str: string) {
  return str.replace(/%([a-zA-Z0-9]+)%/g, function (_match, name) {
    return process.env[name]
  })
}

function glob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    syncGlob(pattern, (error: Error | null, result: string[]) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function streamMove(src: string, dest: string) {
  return new Promise((resolve, reject) => {
    fssync
      .createReadStream(src)
      .pipe(fssync.createWriteStream(dest))
      .on("finish", async () => {
        await fs.unlink(src)
        resolve(null)
      })
      .on("error", reject)
  })
}

function levelSortFunction(a, b) {
  let aLastModified = null;
  if (a.id === undefined) {
    aLastModified = lastModified(`./levels/${a.data.name}`)
  } else {
    aLastModified = lastModified(`./levels/${a.id}`)
  }

  let bLastModified = null;
  if (b.id === undefined) {
    bLastModified = lastModified(`./levels/${b.data.name}`)
  } else {
    bLastModified = lastModified(`./levels/${b.id}`)
  }

  return bLastModified - aLastModified;
}

async function getLevels() {
  let levels = []
  let levelFs = (
    await fs.readdir("./levels", {
      withFileTypes: true,
    })
  ).filter((dirent: fssync.Dirent) => {
    // I want symbolic links to be directories, so use stat
    const stat = fssync.statSync("./levels/" + dirent.name)
    return stat.isDirectory()
  })
  for (let level of levelFs) {
    let mtd = null;
    if (
      (
        await Promise.all(
          ["metadata.json", "data.txt", "bgm.*", "jacket.*"].map(async (file) => {
            if ((await glob(`./levels/${level.name}/${file}`)).length > 0) {
              return true
            } else {
                try {
                  mtd = JSON.parse(await fs.readFile(`./levels/${level.name}/metadata.json`, "utf8"));
                  if (mtd.type === 'imported') {
                    return true;
                  }
                } catch {
                  printWarn(
                    `./levels/${level.name}/${file} was not found.`
                  )
                  return false
                }
            }
          })
        )
      ).every((e) => e)
    ) {
      if (mtd === null) {
        mtd = JSON.parse(await fs.readFile(`./levels/${level.name}/metadata.json`, "utf8"))
      }
      let type = mtd.type;
      if (type === undefined || type === 'local') {
        levels.push(
          new Level(level.name, {
            // title: level_data.match(/#TITLE\s+"(.*)"/)![1],
            title: mtd.title,
            artists: mtd.artists,
            author: mtd.author,
            rating: mtd.rating,
            description: mtd.description,
            genre: mtd.genre,
          })
        )
      } else if (type === 'imported') {
        levels.push(
          new ImportedLevel({
            name: mtd.name,
            rating: mtd.rating,
            title: mtd.title,
            artists: mtd.artists,
            author: mtd.author,
            cover: mtd.cover,
            bgm: mtd.bgm,
            preview: mtd.preview,
            data: mtd.data
          })
        )
      }
    }
  }
  levels = levels.sort(
    (a, b) => levelSortFunction(a, b)
  )
  printInfo(`Loaded ${levelFs.length} levels`)
  return levels;
}

function printSection(section: string, color: string) {
  // @ts-ignore
  console.log(
    "\n-- "[color] +
    section.trim()[color] +
    " " +
    "-".repeat(Math.max(50 - section.length, 0)).grey
  )
}

function printWarn(content: string) {
  console.log("!) ".yellow + content)
}

function printInfo(content: string) {
  console.log("i) ".blue + content)
}

class Level {
  data: any
  id: string
  constructor(id: string, data: { title: string, artists: string, author: string, rating: number, description: string, genre: string }) {
    this.id = id
    this.data = data
  }
  json() {
    return {
      artists: this.data.artists,
      author: this.data.author,
      description: this.data.description,
      genre: this.data.genre,
      bgm: {
        type: "LevelBgm",
        url: `/local/${this.id}/bgm`,
      },
      cover: {
        type: "LevelCover",
        url: `/local/${this.id}/jacket`,
      },
      data: {
        type: "LevelData",
        url: `/local/${this.id}/data`,
      },
      engine: engine,
      name: this.id,
      rating: this.data.rating,
      title: this.data.title,
      useBackground: {
        useDefault: true,
      },
      useEffect: {
        useDefault: true,
      },
      useParticle: {
        useDefault: true,
      },
      useSkin: {
        useDefault: true,
      },
      version: 1,
    }
  }
}

class ImportedLevel {
  data: any
  constructor(data: { name: string, rating: number, title: string, artists: string, author: string, cover: string, bgm: string, preview: string, data: string }) {
    this.data = data
  }
  json() {
    return {
      name: this.data.name,
      version: 1,
      rating: this.data.rating,
      title: this.data.title,
      artists: this.data.artists,
      author: this.data.author,
      cover: {
        type: "LevelCover",
        url: this.data.cover
      },
      bgm: {
        type: "LevelBgm",
        url: this.data.bgm
      },
      preview: {
        type: "LevelPreview",
        url: this.data.preview
      },
      data: {
        type: "LevelData",
        url: this.data.data
      },
      useBackground: {
        useDefault: true,
      },
      useEffect: {
        useDefault: true,
      },
      useParticle: {
        useDefault: true,
      },
      useSkin: {
        useDefault: true,
      },
      engine: engine
    }
  }
}

// -- Misc Endpoints --------------------------------
app.get("/get", async (req, res) => {
  printSection("Get: /get " + req.query.url, "green");

  if (typeof req.query.url === "string") {
    let data = JSON.parse(
      JSON.stringify(
        (await axios.get(req.query.url)).data
      )
    )
    res.json(data);
  }

});

// -- Sonolus endpoints --------------------------------

app.get("/sonolus/info", async (req: Request, res: Response) => {
  printSection("Sonolus: /info", "green")
  const levels = await getLevels()
  const config = await getConfig()
  let bannerIndex = config.serverSettings.selectedBannerIndex
  let banner = null
  if (bannerIndex !== -1) {
    banner = config.serverSettings.serverBanners[bannerIndex]
  }
  res.json({
    title: config.serverSettings.serverTitle,
    levels: {
      items: levels.slice(0, 5).map((level) => level.json()),
      search: {
        options: [
          {
            name: "#KEYWORDS", placeholder: "#KEYWORDS", query: "keywords", type: "text",
          },
          {
            "query": "minRating", "name": "#RATING_MINIMUM", "type": "slider", "def": 0, "min": 0, "max": 50, "step": 1
          },
          {
            "query": "maxRating", "name": "#RATING_MAXIMUM",
            "type": "slider", "def": 50, "min": 0, "max": 50, "step": 1
          }
        ]
      },
    },
    skins: {
      items: [],
      search: {
        options: [
          {
            query: "keywords", name: "#KEYWORDS", type: "text", placeholder: "#KEYWORDS"
          }
        ]
      },
    },
    backgrounds: {
      items: [],
      search: {
        options: [
          {
            query: "keywords", name: "#KEYWORDS", type: "text", placeholder: "#KEYWORDS"
          }
        ]
      },
    },
    particles: {
      items: [],
      search: {
        options: [
          {
            query: "keywords", name: "#KEYWORDS", type: "text", placeholder: "#KEYWORDS"
          }
        ]
      },
    },
    effects: {
      items: [],
      search: {
        options: [
          {
            query: "keywords", name: "#KEYWORDS", type: "text", placeholder: "#KEYWORDS"
          }
        ]
      },
    },
    engines: {
      items: [],
      search: {
        options: [
          {
            query: "keywords", name: "#KEYWORDS", type: "text", placeholder: "#KEYWORDS"
          }
        ]
      },
    },
    // The below field modifies the original "info.d.ts" file.
    banner: {
      type: 'ServerBanner',
      url: banner,
    },
  } as ServerInfo)
  /*
   let data = (await axios.get('https://servers.purplepalette.net/tests/2ymnflis/sonolus/info')).data
   printSection(data, "green")
   res.json(data)
   */
})

app.get("/sonolus/levels/list", async (req: Request, res: Response) => {
  printSection("Sonolus: /levels/list", "green")
  let rawlevels = await getLevels()

  // == Sorting levels ==
  // Keywords
  let levels = []

  const queryKeywords = req.query.keywords
  let keywords = []
  if (typeof queryKeywords === 'string') {
    keywords = queryKeywords.split(" ")
  }

  for (let a = 0; a < rawlevels.length; a++) {
    for (let b = 0; b < keywords.length; b++) {
      if (rawlevels[a].json().title.toLowerCase().includes(keywords[b].toLowerCase())) {
        levels.push(rawlevels[a])
        continue
      }
    }
  }

  if (queryKeywords === undefined) {
    levels = rawlevels
  }

  // Min/Max level
  const queryMinRating = req.query.minRating
  const queryMaxRating = req.query.maxRating
  let minRating = 0
  let maxRating = 50
  if (queryMinRating !== undefined && typeof queryMinRating === 'string') {
    minRating = parseInt(queryMinRating)
  }
  if (queryMaxRating !== undefined && typeof queryMaxRating === 'string') {
    maxRating = parseInt(queryMaxRating)
  }
  if (minRating > maxRating) {
    minRating = maxRating
  }

  rawlevels = levels
  levels = []

  for (let a = 0; a < rawlevels.length; a++) {
    let rating = parseInt(rawlevels[a].json().rating)
    if (rating >= minRating && rating <= maxRating) {
      levels.push(rawlevels[a])
    }
  }

  // == End sorting levels ==

  // Paging
  const queryPage = req.query.page
  let pageQuery = 0
  if (typeof queryPage === 'string') {
    pageQuery = parseInt(queryPage)
  }
  let pageMin = pageQuery * 5
  let pageMax = pageMin + 5
  pageMin = clamp(pageMin, 0, levels.length)
  pageMax = clamp(pageMax, 0, levels.length)
  // End paging

  res.json({
    items: levels.slice(pageMin, pageMax).map((level) => level.json()),
    pageCount: Math.ceil(levels.length / 5),
    search: {
      options: [
        {
          name: "#KEYWORDS", placeholder: "#KEYWORDS", query: "keywords", type: "text",
        },
        {
          "query": "minRating", "name": "#RATING_MINIMUM", "type": "slider", "def": 0, "min": 0, "max": 50, "step": 1
        },
        {
          "query": "maxRating", "name": "#RATING_MAXIMUM", "type": "slider", "def": 50, "min": 0, "max": 50, "step": 1
        }
      ]
    },
  })
})

app.get("/sonolus/levels/:id", async (req: Request, res: Response) => {
  printSection(`Sonolus: /levels/${req.params.id}`, "yellow")
  let mtd = JSON.parse(await fs.readFile(`./levels/${req.params.id}/metadata.json`, "utf8"))
  
  if (mtd.type === undefined || mtd.type === 'local') {
    let level_data = await fs.readFile(
      `./levels/${req.params.id}/data.txt`,
      "utf8"
    )
    let title = level_data.match(/#TITLE\s+"(.*)"/)![1]
    printInfo(`./levels/${req.params.id} - ${title} is loading.`)

    res.json({
      item: new Level(req.params.id, {
        // title,
        title: mtd.title,
        artists: mtd.artists,
        author: mtd.author,
        rating: mtd.rating,
        description: mtd.description,
        genre: mtd.genre,
      }).json(),
      description: mtd.description,
      recommended: [],
    })
  } else {
    let title = mtd.title
    printInfo(`./levels/${req.params.id} - ${title} is loading.`)

    res.json({
      item: new ImportedLevel({
        name: mtd.name,
        rating: mtd.rating,
        title: mtd.title,
        artists: mtd.artists,
        author: mtd.author,
        cover: mtd.cover,
        bgm: mtd.bgm,
        preview: mtd.preview,
        data: mtd.data
      }).json(),
      recommended: [],
    })
  }
})

app.get("/local/:id", async (_req: Request, res: Response) => {
  printSection("Level: /level", "yellow")
  fs2.access(`./levels/${_req.params.id}`, fs2.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send(`Score with the id of ${_req.params.id} does not exist.`)
    }
    else {
      res.render("scorefiles.ejs", {
        bgm: `/local/${_req.params.id}/bgm`,
        data: `/local/${_req.params.id}/data/nodownload`,
        jacket: `/local/${_req.params.id}/jacket`,
        metadata: `/local/${_req.params.id}/metadata`,
      })
    }
  })
})

app.get("/local/:id/bgm", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/bgm`, "yellow")
  let mtd = JSON.parse(await fs.readFile(`./levels/${req.params.id}/metadata.json`, "utf8"))
  if (mtd.type === undefined || mtd.type === 'local') {
    res.sendFile(path.resolve((await glob(`./levels/${req.params.id}/bgm.*`))[0]))
  } else {
    res.redirect(mtd.bgm);
  }
})

app.get("/local/:id/jacket", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/jacket`, "yellow")
  let mtd = JSON.parse(await fs.readFile(`./levels/${req.params.id}/metadata.json`, "utf8"))
  if (mtd.type === undefined || mtd.type === 'local') {
    let jacketPath: string | undefined = (
      await glob(`./levels/${req.params.id}/jacket.*`)
    )[0]
    if (jacketPath) {
      printInfo(`${jacketPath} I found.`)
      res.sendFile(path.resolve(jacketPath))
    } else {
      printWarn(`${jacketPath} was not found.`)
      res.send(await fs.readFile(`public/empty.png`))
    }
  } else {
    res.redirect(mtd.cover);
  }
})

app.get("/local/:id/data", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/data`, "yellow")
  let mtd = JSON.parse(await fs.readFile(`./levels/${req.params.id}/metadata.json`, "utf8"))
  if (mtd.type === undefined || mtd.type === 'local') {
    printInfo(`./levels/${req.params.id}/data.txt is being converted.`)
    let data = await fs.readFile(`./levels/${req.params.id}/data.txt`, "utf8")
    res.send(gzipSync(JSON.stringify(fromSus(data))))
  } else {
    let data = (await axios.get(mtd.data)).data;
    res.send(gzipSync(JSON.stringify(fromSus(data))))
  }
})

app.get("/local/:id/data/nodownload", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/data`, "yellow")
  let mtd = JSON.parse(await fs.readFile(`./levels/${req.params.id}/metadata.json`, "utf8"))
  if (mtd.type === undefined || mtd.type === 'local') {
    let options = {
      root: path.join(__dirname)
    }
    res.sendFile(`./levels/${req.params.id}/data.txt`, options, function (err) {
      if (err) {
        printWarn(err.message)
        res.sendStatus(404)
      }
      else printInfo("Sent " + `./levels/${req.params.id}/data`)
    })
  } else {
    res.redirect(mtd.data)
  }
})

app.get("/local/:id/metadata", async (req: Request, res: Response) => {
  printSection(`Sonolus: /local/${req.params.id}/metadata`, "yellow")
  let options = {
    root: path.join(__dirname)
  }
  res.sendFile(`./levels/${req.params.id}/metadata.json`, options, function (err) {
    if (err) {
      printWarn(err.message)
      res.sendStatus(404)
    }
    else printInfo("Sent " + `./levels/${req.params.id}/metadata`)
  })
})

// -- Download mover -----------------------------------

async function queryDownload() {
  for (let g of await glob(
    parseEnv(await getConfig("downloadPath")) + "/*.sus"
  )) {
    if (Date.now() - (await fs.stat(g)).ctime.getTime() < 1500) {
      printSection(`Downloads`, "blue")
      printInfo(`${g} is loading.`)
      let susData = await fs.readFile(g, "utf8")
      let designer = susData.match(/#DESIGNER\s+"(.*)"/)![1]
      if (designer.length <= 0) {
        printWarn("Music author is not set.")
        printWarn("Change it to the name of the directory you want to move Music Author to.")
      } else {
        try {
          await fs.access(`./levels/${designer}`)
          printInfo(
            `${designer} I found. ./levels/${designer}/data.txt Go to.`
          )
          await streamMove(g, `./levels/${designer}/data.txt`)
          printInfo(`moved.`)
        } catch (e: any) {
          if (e.code === "ENOENT") {
            printWarn(`./levels/${designer} was not found.`)
            printWarn("Check with the music author for spelling errors.")
          } else {
            throw e
          }
        }
      }
    }
  }
}

// -- UI -----------------------------------------------

app.use(express.static("public"))

app.get("/", async (_req: Request, res: Response) => {
  printSection("UI: /", "magenta")
  res.render("index.ejs", {
    defaultConfig,
    file: replaceSlash(process.env.USERPROFILE + "/SonoLite.json"),
    config: await getConfig(),
  })
})

app.get("/levels", async (_req: Request, res: Response) => {
  printSection("UI: /levels", "magenta")
  let levels = []
  printInfo("I am getting the sheet music.")
  for (let level of await getLevels()) {
    // printInfo(`./levels/${level.name} was recognized as a valid directory.`)
    let mtd = null;
    if (level.id === undefined) {
      mtd = JSON.parse(await fs.readFile(`./levels/${level.data.name}/metadata.json`, "utf8"))
    } else {
      mtd = JSON.parse(await fs.readFile(`./levels/${level.id}/metadata.json`, "utf8"))
    }
    if (mtd.type === undefined || mtd.type === 'local') {
      let data: LevelData = {
        id: level.id,
        sustitle: undefined,
        size: undefined,
        editor: undefined,
        metadata: undefined,
      }
  
      let levelData = await fs.readFile(`./levels/${level.id}/data.txt`, "utf8")
      data.sustitle = levelData.match(/#TITLE\s+"(.*)"/)?.[1] || "?"
      data.size = levelData.length
      if (levelData.match(/^This file was generated by (.*)\./)) {
        data.editor = levelData.match(/^This file was generated by (.*)\./)![1]
      } else {
        data.editor = "?"
      }
      data.metadata = mtd
  
      levels.push(data)
    } else if (mtd.type === 'imported') {
      let data: LevelData = {
        id: level.data.name,
        sustitle: undefined,
        size: undefined,
        editor: undefined,
        metadata: mtd
      }
      levels.push(data);
    }
  }
  res.render("scorelist.ejs", {
    levels,
    config: await getConfig(),
  })
})

app.get("/add", async (_req: Request, res: Response) => {
  printSection("UI: /add", "magenta")
  let config = await getConfig()
  res.render("addscore.ejs", {
    editing: false,
    id: undefined,
    title: undefined,
    artists: undefined,
    author: undefined,
    genre: undefined,
    description: undefined,
    difficulty: undefined,
    jacketPath: undefined,
    musicPath: undefined,
    scorePath: undefined,
    config: config,
    jacketLimitBytes: config.fileLimits.jacketLimit * 1048576,
    musicLimitBytes: config.fileLimits.musicLimit * 1048576,
    dataLimitBytes: config.fileLimits.dataLimit * 1048576,
  })
})

app.get("/edit", async (_req: Request, res: Response) => {
  printSection("UI: /edit", "magenta")
  let id = _req.query.id
  if (id === undefined) {
    res.sendStatus(400)
    return
  }
  let level_metadata = JSON.parse(await fs.readFile(`./levels/${id}/metadata.json`, "utf8"))

  res.render("addscore.ejs", {
    editing: true,
    id: id,
    title: level_metadata.title,
    artists: level_metadata.artists,
    author: level_metadata.author,
    genre: level_metadata.genre,
    description: level_metadata.description,
    difficulty: level_metadata.rating,
    jacketPath: `./levels/${id}/jacket`,
    musicPath: `./levels/${id}/bgm.mp3`,
    scorePath: `./levels/${id}/data.txt`,
    config: await getConfig(),
  })
})

app.get("/editor", async (_req: Request, res: Response) => {
  printSection("UI: /editor", "magenta")
  res.render("editor.ejs")
})

app.get("/levels/:id/:file", async (_req: Request, res: Response) => {
  printSection("Level: /level", "yellow")
  let options = {
    root: path.join(__dirname)
  }
  let id = _req.params.id
  let file = _req.params.file
  if (file === "metadata") {
    res.sendFile(`./levels/${id}/${file}.json`, options, function (err) {
      if (err) {
        printWarn(err.message)
        res.sendStatus(404)
      }
      else printInfo("Sent " + `./levels/${id}/${file}`)
    })
  } else if (file === "bgm") {
    res.sendFile(`./levels/${id}/${file}.mp3`, options, function (err) {
      if (err) {
        printWarn(err.message)
        res.sendStatus(404)
      }
      else printInfo("Sent " + `./levels/${id}/${file}`)
    })
  } else if (file === "data") {
    res.sendFile(`./levels/${id}/${file}.txt`, options, function (err) {
      if (err) {
        printWarn(err.message)
        res.sendStatus(404)
      }
      else printInfo("Sent " + `./levels/${id}/${file}`)
    })
  } else {
    if (file.startsWith("jacket")) {
      let jacketPath: string | undefined = (
        await glob(`./levels/${id}/jacket.*`)
      )[0]
      if (jacketPath) {
        res.sendFile(path.resolve(jacketPath))
      } else {
        res.sendStatus(404)
      }
    } else {
      res.sendStatus(404)
    }
  }
})

app.post("/post/checkpwd", async (req: Request, res: Response) => {
  printSection("UI: /post/checkpwd", "magenta")
  printInfo("Checking equality of given password.")
  if (req.body.password === await getConfig("password")) {
    printInfo("Passwords are equal.")
    res.json({ status: "ok" })
  } else {
    printInfo("Passwords are not equal.")
    res.json({ status: "fail" })
  }
})

app.post("/post/config", async (req: Request, res: Response) => {
  printSection("UI: /post/config", "magenta")
  printInfo("Updating settings.")
  await setConfig(req.body)
  printInfo("Updated settings.")
  res.json({ status: "ok" })
})

app.post("/post/add", async (req: Request, res: Response) => {
  printSection("UI: /add", "magenta")
  printInfo("Adding score.")
  if (await getConfig("passwordProtectionEnabled")) {
    if (req.body.verification === await getConfig("password")) {
      if (await addScore(req.body)) {
        printInfo("Added score.")
        res.json({ status: "ok" })
      } else {
        printInfo("Failed to add score.")
        res.json({ status: "internal_error" })
      }
    } else {
      res.json({ status: "auth_failed" })
      printInfo("Authentication failed.")
      return
    }
  } else {
    if (await addScore(req.body)) {
      printInfo("Added score.")
      res.json({ status: "ok" })
    } else {
      printInfo("Failed to add score.")
      res.json({ status: "internal_error" })
    }
  }
})

app.post("/post/edit", async (req: Request, res: Response) => {
  printSection("UI: /edit", "magenta")
  printInfo("Editing score.")
  if (await getConfig("passwordProtectionEnabled")) {
    if (req.body.verification === await getConfig("password")) {
      if (await editScore(req.body)) {
        printInfo("Edited score.")
        res.json({ status: "ok" })
      } else {
        printInfo("Failed to edit score.")
        res.json({ status: "internal_error" })
      }
    } else {
      res.json({ status: "auth_failed" })
      printInfo("Authentication failed.")
      return
    }
  } else {
    if (await editScore(req.body)) {
      printInfo("Edited score.")
      res.json({ status: "ok" })
    } else {
      printInfo("Failed to edit score.")
      res.json({ status: "internal_error" })
    }
  }
})

app.post("/post/delete", async (req: Request, res: Response) => {
  printSection("UI: /delete", "magenta")
  printInfo("Deleting score.")
  if (await getConfig("passwordProtectionEnabled")) {
    if (req.body.verification === await getConfig("password")) {
      if (await deleteScore(req.body.id)) {
        printInfo("Deleted score.")
        res.json({ status: "ok" })
      } else {
        printInfo("Failed to delete score.")
        res.json({ status: "internal_error" })
      }
    } else {
      res.json({ status: "auth_failed" })
      printInfo("Authentication failed.")
      return
    }
  } else {
    if (await deleteScore(req.body.id)) {
      printInfo("Deleted score.")
      res.json({ status: "ok" })
    } else {
      printInfo("Failed to delete score.")
      res.json({ status: "internal_error" })
    }
  }
})

// -- Main ---------------------------------------------

function tryListen(port: number, tries: number) {
  return new Promise((resolve, reject) => {
    app
      .listen(port, "0.0.0.0", async () => {
        resolve(null)
        const ip = Object.values(os.networkInterfaces())
          .flat()
          .filter(
            ({
              // @ts-ignore
              family,
              // @ts-ignore
              internal,
            }) => family === "IPv4" && !internal
          )[0]
        printSection("System: Hello!", "red")
        printInfo(`Welcome to SonoLite v${version}!`)
        printInfo(``)
        printInfo(`Open Sonolus and enter the following in the server URL:`)
        // @ts-ignore
        printInfo("  " + `http://${ip.address}:${port}`.underline)
        printInfo(
          `To access the menu, open the following URL in your browser:`
        )
        // @ts-ignore
        printInfo("  " + `http://localhost:${port}`.underline)
        if (tries !== 0) {
          printWarn("")
          printWarn(
            `Port ${port - tries
            } is in use, so ${port} is used.`
          )
          printWarn(
            `Port ${port - tries
            } open or change the port number in the menu.`
          )
          printWarn("")
        }
        printInfo(``)
        printInfo(`Exit with Ctrl+C.`)
        printInfo(``)
        printInfo(`Created by ` + `MasterCoder21`.blue)
        printInfo(``)
        printInfo(`Originally created by ` + `名無し｡(@sevenc-nanashi)`.blue)
        printInfo(``)

        try {
          await fs.access(`./levels`)
        } catch {
          await fs.mkdir(`./levels`)
          printInfo(`I created a levels directory.`)
        }
      })
      .on("error", reject)
  })
}

async function setEngine() {
  engine = JSON.parse(
    JSON.stringify(
      (await axios.get("https://fp.sevenc7c.com/sonolus/engines/frpt-pjsekai.extended"))
        .data.item
    ).replace(/"\//g, '"https://fp.sevenc7c.com/')
  )
}

async function main() {
  // setInterval(queryDownload, 1000)
  setEngine()
  setConfig()

  for (let i = 0; i < 10; i++) {
    let port = (await getConfig("port")) + i
    try {
      await tryListen(port, i)
      break
    } catch (e: any) {
      if (e.code === "EADDRINUSE") {
        continue
      } else {
        throw e
      }
    }
  }
}

if (require.main === module) {
  main()
}

// -- Types --------------------------------------------

interface LevelData {
  id: string | undefined
  sustitle: string | undefined
  size: string | number | undefined
  editor: string | undefined
  metadata: JSON | undefined
}

