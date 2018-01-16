


$(document).ready(function(){

	$( "#gallery-list" ).sortable({
		axis: 'y',
		update: function(event,ui){
			gh.sortItems($(this).sortable('toArray'));
		}
	}).disableSelection();

	$('#files').on('change',handleFileSelect);
	$("#show-form").click(showPopUp);
	$("#close-form").click(hidePopUp);

	$("#gallery-form").on('submit',function(){
		try{
			var id = $('#form-edition').val();
			//Add
			if( id == -1){
				try{
					newItem = gh.addItem();
					addItemMarkUp(newItem);
					refreshCounter();
				} catch(e){
					console.log(e);
				}
			//Edit
		} else {
			try{
				gh.editItem(id);
				$('#listitem-'+id+' img').attr('src',$('.sample').attr('src'));
				$('#listitem-'+id+' .photo-description').html($('#description').val());
			} catch(e){
				console.log(e);
			}

		}

	} catch(e){
		console.log(e);
	}
	hidePopUp();
	return false;
});

	$('#gallery-list').on('click','.edit',function(e){
		var id = $(this).data('id');
		$('#description').val($('#listitem-'+id+' .photo-description').html());
		$('#form-edition').val(id);
		$('#edit').append('<img>');
		$('#edit').append('<p>');
		$('#edit p').html('Editing this photo');
		$('#edit p').addClass('edit-label');
		$('#edit img').addClass('edit-sample-photo');
		$('#edit img').attr('src',$('#listitem-'+id+' .image-container img').attr('src'));
		showPopUp();
		
	});

	$('#gallery-list').on('click','.delete',function(e){
		e.preventDefault();
		var id = $(this).data('id');
		if(!confirm('Delete ? ')){
			return false;
		}
		try{
			gh.deleteItem(id);
		} catch(e){
			console.log(e);
			return false;
		}
		$('#listitem-'+id).remove();
		refreshCounter();
	});

	dh = new DatabaseLocalStorageHandler('list2');
	dh.init();
	gh = new GalleryHandler(dh);
	gh.init();
	$(gh.getItems()).each(function(){
			addItemMarkUp($(this)['0']);
	});
	refreshCounter();
});

/*Functions*/

function showPopUp()
{
	$("#gallery-form-container").fadeIn();
	$("#gallery-form-container").css({"visibility":"visible","display":"block"});
}

function hidePopUp()
{
	$("#gallery-form-container").fadeOut();
	$("#gallery-form-container").css({"visibility":"hidden","display":"none"});
	$('#description').val(null);
	$('#list span').detach();
	var inputFile = $('#files');
	inputFile.replaceWith( inputFile = inputFile.clone( true ) );
	$('#form-edition').val("-1");
	$('#edit').empty();
}

function refreshCounter(){

	$('#counter').html('<span>Items: '+gh.getNroItems()+'</span>');
}

function addItemMarkUp(newItem){
	$('#gallery-list').append('<div id="listitem-' + newItem.id +
		'" ><div class="col-md-4 image-container"><img src="'+newItem.imgSrc+'" class="thumb" id="thumb-'+newItem.id+
		'" /><br /><center> ' + newItem.description + '<a href="#" class="edit" data-id="'+newItem.id+
		'"><span class="glyphicon glyphicon-edit"></span></a><a href="#" data-id="'+newItem.id+
		'" class="delete"><span class="glyphicon glyphicon-remove-circle"></span></a></center></div></div>');
}


/*
		Upload Photo
*/
function handleFileSelect(evt) {
    var files = evt.target.files; 


    for (var i = 0, f; f = files[i]; i++) {


      if (!f.type.match('image.*')) {
      	continue;
      }
      var reader = new FileReader();

      reader.onload = (function(theFile) {
      	return function(e) {
          
          var span = document.createElement('span');
          span.innerHTML = ['<img class="sample" src="', e.target.result,
          '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null);
        };
      })(f);

      
      reader.readAsDataURL(f);
    }
  }


/*Local Storage */

function DatabaseLocalStorageHandler(name){

	this.database_name = name;

	this.init = function(){
		if(localStorage.getItem('lastIndex') == null){
			this.setLastIndex(0);
		} 
	}

	this.save = function(items){
		localStorage.setItem(this.database_name, JSON.stringify(items));
	}

	this.getItems = function(){
		return localStorage.getItem(this.database_name);
	}


	this.getLastIndex = function(){
		return localStorage.getItem('lastIndex');
	}

	this.setLastIndex = function(lastIndex){
		localStorage.setItem('lastIndex',lastIndex);
	}

	this.increaseLastIndex = function(){
		var id = parseInt(this.getLastIndex())+1;
		this.setLastIndex(id);
	}

}

/*
		Image gallery Class
*/
function GalleryHandler(dh) {

	var items = [];
	var database = dh;

	this.getNroItems = function() {
		return 	items ? items.length : 0;
	}

	this.init = function(){
			items = database.getItems();
			items = items ? JSON.parse(items) : [];
	}

	this.getItems = function(){
		return items;
	}

	this.addItem = function(){
		var thumb = $('.sample');
		var newItem = 
		{ 
			"id" : database.getLastIndex(),
			"description" : $('#description').val(),
			"imgSrc": thumb.attr('src')
		};
		items.push(newItem);
		database.save(items);
		database.increaseLastIndex();
		return newItem;
	}

	this.editItem = function(id){
		var newImage = $('.sample').attr('src');
		for(var i=0;i<items.length;i++){
			if(items[i].id == id){
				items[i].description = $('#description').val();
				if( typeof newImage !== "undefined"){
					items[i].imgSrc = $('.sample').attr('src');
				}
				database.save(items);
				break;
			}
		}
	}

	this.deleteItem = function(id){
		for(var i=0;i<items.length;i++){
			if(items[i].id == id){
				items.splice(i,1);
			}
		}
		database.save(items);
	}



	this.sortItems = function(newOrder){
		var	newOrderItems = [];
		for(var i=0;i<newOrder.length;i++){
			newId = parseInt(newOrder[i].split("-")[1]);
			for(var j=0;i<items.length;j++){
				if(items[j].id == newId){
					newOrderItems.push(items[j]);
					break;
				}
			}
		}

		items = newOrderItems;
		database.save(items);
	}

};
