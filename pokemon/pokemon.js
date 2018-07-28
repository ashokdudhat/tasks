  
var Pokemon =  (function (){

    console.log("Pokemon....");

    var pokemonLimit=200;
    var species =[];
    var sentData={
					mode: "cors", // no-cors, cors, *same-origin
					cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
					credentials: "same-origin", // include, same-origin, *omit
					headers: {
								"Content-Type": "application/json; charset=utf-8",
							 }
				};
     
    //constructors
    var Species = function(data)
    {
    	this.id = data.id;
	    this.name = data.name;
	    this.sprite = data.sprites.front_default;
	    this.type = data.types[0].type.name; 

    };

	return {

	     init: function()
	     {
	         console.log("Application has started...");
	         document.getElementById('chain-container').style.display='none';
	         document.getElementById('details-view').style.display='none';
	         document.getElementById("main-view").addEventListener("click", Pokemon.actions.clickedAction);
	       
	         Pokemon.displaySpeciesList();
	     },

	     actions : {

	     	  clickedAction : function(e)
			  {
			  		console.log("clickedAction....");
					if(e.target && e.target.nodeName == "BUTTON") 
					{
						var id=e.target.id.replace("btn-", "");
						//console.log("List item ", id, " was clicked!");
						Pokemon.showEvolutionChain(id);
					}
					if(e.target && e.target.nodeName == "DIV") 
					{
						var id=e.target.id.replace("details-", "");
						Pokemon.showDetails(id);
					}
					if(e.target && e.target.nodeName == "SELECT") 
					{
						//var value=e.target.value;

						//get current selected sort by value
						var sortBy = document.getElementById("sort-by");
						var sortByValue = sortBy.options[sortBy.selectedIndex].value;
						species.sort(Pokemon.actions.compareValues(sortByValue));

						//get current selected order by value
						var orderBy = document.getElementById("order-by");
						var orderByValue = orderBy.options[orderBy.selectedIndex].value;
						if(orderByValue=='desc')
							species.reverse();

						document.getElementById('pokemon-list-view').innerHTML = "";

						species.forEach(function(currentValue,index,array) {
						  Pokemon.showSpecies(currentValue);
						});
					}
					e.preventDefault();
			  },

			  compareValues : function (propName, order='asc') 
			  {

			  	  console.log("compareValues...");

				  return function(a, b) 
				  {
				  	//check if property exist or not, if property doesn't exist then return now.
				    if(!a.hasOwnProperty(propName) || !b.hasOwnProperty(propName)) 
				    {
				        return 0; 
				    }

				 	//convert string in same case so prevent errors
				    const varA = (typeof a[propName] === 'string') ? a[propName].toUpperCase() : a[propName];
				    const varB = (typeof b[propName] === 'string') ? b[propName].toUpperCase() : b[propName];

				    let comparison = 0;
				    if (varA > varB) {
				      comparison = 1;
				    } else if (varA < varB) {
				      comparison = -1;
				    }

				    return comparison;

				  };

				},
	     },

	     displaySpeciesList : function()
	     {

	     	console.log("displaySpeciesList....");
	     	
	     	for(var id=1; id<=pokemonLimit; id++)
			{
				Pokemon.getSpecies(id);		
			} 

	     },

	     getSpecies : function(id)
		 {
		 		console.log("getSpecies...");

		 		try {
							fetch(`https://pokeapi.co/api/v2/pokemon/${id}`,sentData)
				            .then(result => {
				                //console.log(result);
				                return  result.json();

				            })
				            .then(data => {
				            	
				                //console.log(data);
				                //store data
								var newItem=new Species(data);
								species[newItem.id]=newItem;
								Pokemon.showSpecies(newItem);
				               
				            })
				            .catch(error => console.log(error));
			     }
			    catch(error) 
			    {
					  console.log(error);
				}
		  },

		  showSpecies : function(newItem)
		  {
		  	//add dynamic pokemon list to main container
			var newHtml=`<div class="pokemon-cell" >
							<div class="pokemon-id">
								# ${newItem.id}
							</div>

							<div class="pokemon-sprite-container">
								<img class="pokemon-sprite" src="${newItem.sprite}" >
								<div class="details-container">
									<div class="details-hover" id="details-${newItem.id}">Click here for more details</div>
								</div>
							</div>
												          
							<div class="pokemon-name">
								${newItem.name}
							</div>
							<button id="btn-${newItem.id}" class="btn-chain">Show Evolution Chain</button>
						</div>`;
			document.getElementById('pokemon-list-view').insertAdjacentHTML('beforeend',newHtml);
		  },

		 showEvolutionChain : function(id)
		 {
		 		console.log("showEvolutionChain...");

		 		var newHtml,hasChain;
		 		document.getElementById('chain-container').style.display='block';

		 		try {


		 					document.getElementById('evolution-chain-view').innerHTML = "";
							
							fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}`,sentData)
				            .then(result => {
				                return result.json();
				            })
				            .then(data => {

				                var evoChain = [];
								var evoData = data.chain;
								hasChain=false;

								do {

								  var evoDetails = evoData['evolution_details'][0];
								  var url=evoData.species.url;
								  var id = url.split("pokemon-species/");
								  id=id[1].replace('/', '');

								  if(species[id]!=undefined)
								  {
								  	
								  	hasChain=true;

					             	newHtml=`<div class="pokemon-cell" >
								          <div class="pokemon-id">
								            # ${species[id].id}
								          </div>
								          <img  class="pokemon-sprite" src="${species[id].sprite}">
								          <div class="pokemon-name">
								           ${species[id].name}
								          </div>
								          <button id="btn-${species[id].id}" class="btn-chain">Show Evolution Chain</button>
								        </div>`;
            						document.getElementById('evolution-chain-view').insertAdjacentHTML('beforeend',newHtml);
            					  }

            					 //stored evolution data chain
								 evoChain.push({
								  	"id" : id,
								    "species_name": evoData.species.name,
								    "url" : url,
								    "min_level": !evoDetails ? 1 : evoDetails.min_level,
								    "trigger_name": !evoDetails ? null : evoDetails.trigger.name,
								    "item": !evoDetails ? null : evoDetails.item
								  });

								  evoData = evoData['evolves_to'][0];
								} while (!!evoData && evoData.hasOwnProperty('evolves_to'));

								//all evoluation chain data
								//console.log(evoChain);

								if(!hasChain)
									document.getElementById('evolution-chain-view').insertAdjacentHTML('beforeend','Sorry this species not have evoluation chain!');

				            })
				            .catch(error => console.log(error));
				         

			        }
			    catch(error) {
					    console.log(error);
				}
		 	
		 },

		 showDetails : function(id)
		 {
		 		console.log("showDetails...");

		 		document.getElementById('details-view').style.display='block';

		 		try {

						
							fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`,sentData)
				            .then(result => {
				                return  result.json();
				            })
				            .then(data => {

								var newHtml=`<div class="details-data" >
												ID: ${id} <br>
												Name: ${data.name} <br>
												Capture Rate: ${data.capture_rate} <br>
												Base Happiness: ${data.base_happiness} <br>
												Color: ${data.color.name} <br>
												Shape: ${data.shape.name} <br>	          
											</div>`;
				            	document.getElementById('details-view').insertAdjacentHTML('beforeend',newHtml);
				               
				            })
				            .catch(error => console.log(error));
			    }
			    catch(error) 
			    {
					    console.log(error);
				}

		 },

		 testing : function () 
		 {
		 	console.log("testing...");
        	console.log(species);
    	 }
	}

})();
Pokemon.init();











