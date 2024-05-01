var prices = {};
var maxes = {};
var zone = null;
var isrank = 0;


// $(".full-screen, .btnIcon").hide();


function closeMain() {
	$(".full-screen, .btnIcon").hide();
}


function openMain() {
	$(".full-screen").show();
}


function closeAll() {
	closeMain();
}


$(".close").click(function(){
    $.post('http://egy_store/quit', JSON.stringify({}));
	closeAll();
});


$(".btnIcon").click(function(){
    $.post('http://egy_store/manage', JSON.stringify({
		loc: zone,
		rank: isrank
	}));
});


function setStoreTitle(newTitle) {
	$('#storeTitle').text(newTitle);
	storeTitle = newTitle; 
}


window.addEventListener('message', function (event) {
	var item = event.data;
	var storename = item.storename;
	var isowner = item.own;
	storeid = item.stid;

	if (item.message == "show") {
		if (item.clear == true){
			$(".home").empty();
			prices = {};
			maxes = {};
		}
		setStoreTitle(storename);
		zone = storeid;
		openMain();
		if (isowner == 'isowner'){
			$(".btnIcon").show();
			isrank = item.rankva;
		} else {
			$(".btnIcon").hide();
		}
	}

	if (item.message == "hide") {
		closeMain();
	}
	
	if (item.message == "add"){
		// $(".home").append('<div class="card">' +
		// 	'<div class="image-holder">' +
		// 	'<img  src="img/' + item.item + '.png" onerror="this.src = \'img/default.png\'" alt="' + item.label + '" style="width:60px">' + 
		// 	'</div>' +
		// 	'<div class="container">' + 
		// 	'<h4><b><div class="labelitem">' + item.label  + '</div><div class="price">' + item.price + '$</div></b></h4> ' +
		// 	'<div class="quantity">' + 
		// 	'<div class="minus-btn btnquantity" name="' + item.item + '" id="minus"><img src="img/minus.png" alt="" /></div>' +
		// 	'<div class="number" name="name">1</div>' + 
		// 	'<div class="plus-btn btnquantity" name="' + item.item + '" id="plus"><img src="img/plus.png" alt="" /></div>' +
		// 	'</div>' +
		// 	'<div class="purchase">' + 
		// 	'<div class="buy" name="' + item.item + '">شراء</div>' + 
		// 	'</div>' +
		// 	'</div>' +
		// 	'<center>'+
		// 	'x<span class="stock">'+item.stock+'</span> في المخزون'+
		// 	'</center>'+
		// 	'</div>');
		// prices[item.item] = item.price;
		// maxes[item.item] = item.max;
		// zone = item.loc;

		const items = Array.from({ length: 50 }, (_, i) => `

<div class="card">
	<input type="number" class="number" name="name" value="1" min="0" max="100">
	<div class="image-holder">
		<img src="${'img/'+item.item +'.png'}" onerror="this.src = 'img/default.png'" alt="${item.label}" style="width:100%">
	</div>

	<div class="container">
		<div class="purchase">
			<div class="price">${item.price}</div>
			<div class="buy" name="${item.item}">شراء</div>
		</div>
	</div>

	<center>
		<div class="labelitem"> ${item.label}</div>
		<span class="on_stock">x<span class="stock">${item.stock}</span></span>
	</center>

</div>
`);

		
	}
	
	prices[item.item] = item.price;
	maxes[item.item] = item.max;
	zone = item.loc;
});


$(".home").on("click", ".btnquantity", function() {
	var $button = $(this);
	var $name = $button.attr('name');
	var oldValue = $button.parent().find(".number").text();
	var newVal = ( $button.attr('id') === "plus" && oldValue < maxes[$name] ) ? parseFloat(oldValue) + 1 : (oldValue > 1) ? parseFloat(oldValue) - 1 : 1;
	$button.parent().parent().find(".price").text((prices[$name] * newVal) + "$");
	$button.parent().find(".number").text(newVal);
});


$(".home").on("click", ".buy", function() {
	var $button = $(this);
	var $name = $button.attr('name');
	var $stock = parseFloat($button.parent().parent().find(".stock").text());
	var $count = parseFloat($button.parent().parent().find(".number").text());
	var $price = parseFloat($button.parent().parent().find(".price").text());
	var $label = $button.parent().parent().find(".labelitem").text();
	$.post('http://egy_store/purchase', JSON.stringify({
		item: $name,
		count: $count,
		loc: zone,
		price: $price,
		labelitem: $label,
	}));
});


document.onkeyup = function (data) {
	if (data.which == 27) { 
		$.post('http://egy_store/quit', JSON.stringify({}));
		$(".btnIcon").hide();
	}
};



const itemsPerPage = 12;
let currentPage = 1;

function renderItems() {
    const itemList = document.querySelector('.home');
    itemList.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = items.slice(startIndex, endIndex);

	itemsToShow.forEach(item => {
		itemList.innerHTML += item;
	}
	);
	// // Update page info
	const pageInfo = document.querySelector('.pages');
	const totalPages = Math.ceil(items.length / itemsPerPage);
	pageInfo.textContent = `${currentPage}/${totalPages}`;
}

document.querySelector('.prev').addEventListener('click', () => {
	currentPage = Math.max(currentPage - 1, 1);
	renderItems();
}
);

document.querySelector('.next').addEventListener('click', () => {
	currentPage = Math.min(currentPage + 1, Math.ceil(items.length / itemsPerPage));
	renderItems();
}
);

renderItems();


