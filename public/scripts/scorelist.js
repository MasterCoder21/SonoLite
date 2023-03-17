async function deleteScore(id) {
    if (confirm("Do you want to delete this score?")) {
        let response = await fetch('/post/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                verification: document.getElementById('verification_' + id).value,
            })
        })
        let status = (await response.json())['status']
        if (status === 'ok') {
            alert('Deleted score.')
            window.location.href = '/levels'
        } else {
            alert('Failed to delete score. -- ' + status)
        }
    }
}

async function editScore(id) {
    window.location.href = '/edit?id=' + id;
}

async function searchCards() {
    // Get the search input value
    var searchValue = $("#cardSearch").val();
    var searchMethod = $("#cardSearchMethod").val();

    // Loop through all the cards
    $(".card.outer").each(function () {
        // Get the card title
        var cardTitle = $(this).find(searchMethod).text();

        // Check if the card title contains the search value
        if (cardTitle.toLowerCase().indexOf(searchValue.toLowerCase()) != -1) {
            // Show the card
            $(this).show();
        } else {
            // Hide the card
            $(this).hide();
            $(this).find(".card").show();
        }
    });
}

async function copyMetadata(lvl) {
    var mtd = [];
    mtd.push(
        `Title: ${lvl.metadata.title}\n`,
        `Artists: ${lvl.metadata.title}\n`,
        `Author: ${lvl.metadata.title}\n`,
        `Rating: ${lvl.metadata.title}\n`,
        `Description: ${lvl.metadata.title}\n`,
        `Genre: ${lvl.metadata.title}`,
    );
    navigator.clipboard.writeText(mtd.join(""));
    alert(`Copied metadata for level: ${lvl.id}`);
}

// =================================================================
// PAGINATION
// =================================================================
var cardsPerPage = 5;
var cards = document.querySelectorAll(".card.outer");
var numberOfPages = Math.ceil(cards.length / cardsPerPage);
var currentPage = 1;

var paginationHTML = '<li class="page-item"><a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li>';
for (var i = 1; i <= numberOfPages; i++) {
    paginationHTML += '<li class="page-item"><a class="page-link" href="#">' + i + '</a></li>';
}
paginationHTML += '<li class="page-item"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>';
document.getElementById("pagination").innerHTML = paginationHTML;

var counterText = `Page ${currentPage} / ${numberOfPages}`;
document.getElementById("counter").textContent = counterText;

function showPage(page) {
    //hide all the cards
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.display = "none";
    }
    //calculate the start and end index of the cards to show on the current page
    var startIndex = (page - 1) * cardsPerPage;
    var endIndex = startIndex + cardsPerPage;

    //show only the cards for the current page
    for (var i = startIndex; i < endIndex; i++) {
        if (cards[i]) {
            cards[i].style.display = "block";
        }
    }

    counterText = `Page ${page} / ${numberOfPages}`;
    document.getElementById("counter").textContent = counterText;
}
var pageLinks = document.querySelectorAll(".page-link");

//add an event listener to each page link
for (var i = 1; i < pageLinks.length - 1; i++) {
    pageLinks[i].addEventListener("click", function (e) {
        e.preventDefault();
        //get the page number from the link's text
        var pageNumber = parseInt(this.text);
        //call the showPage function with the appropriate page number
        showPage(pageNumber);
        updatePagination();
        //update the currentPage variable
        currentPage = pageNumber;
    });
}
pageLinks[0].addEventListener("click", function (e) {
    e.preventDefault();
    //get the page number from the link's text
    var pageNumber = currentPage - 1;
    if (pageNumber < 1) pageNumber = 1;
    //call the showPage function with the appropriate page number
    showPage(pageNumber);
    updatePagination();
    //update the currentPage variable
    currentPage = pageNumber;
})
pageLinks[pageLinks.length - 1].addEventListener("click", function (e) {
    e.preventDefault();
    //get the page number from the link's text
    var pageNumber = currentPage + 1;
    if (pageNumber > numberOfPages) pageNumber = numberOfPages;
    //call the showPage function with the appropriate page number
    showPage(pageNumber);
    updatePagination();
    //update the currentPage variable
    currentPage = pageNumber;
})
function updatePagination() {
    //remove the "active" class from all page links
    for (var i = 0; i < pageLinks.length; i++) {
        pageLinks[i].classList.remove("active");
    }
    //add the "active" class to the page link for the current page
    pageLinks[currentPage - 1].classList.add("active");
}
showPage(1);
updatePagination();