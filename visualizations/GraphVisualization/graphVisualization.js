
//help functions
function GetValueNumber(stringVal,maxNumberInString){
	return stringVal == maxNumberInString ? Number.MAX_VALUE : parseInt(stringVal);
}

function TextCutter(text,sizeCompare,sizeCut){
	return text.length < sizeCompare ? text : text.substring(0,sizeCut)+"..."; 
}

//functions for expander control
function GetExpanderFunction(currentControl){
    var expanderButton = ".expanderhead > .expanderbutton";
    $(currentControl+ " > "+expanderButton).on("click",function(){
    
        if($(currentControl+ " > .expanderbody").css("display") == "none"){
            $(currentControl+ " > .expanderbody").css("display","");
            $(currentControl+ " > "+expanderButton).text("x");
        }else{
            $(currentControl+ " > .expanderbody").css("display","none");
            $(currentControl+ " > "+expanderButton).text("+");
        }
    });
};


function GenerateExpander(controlId){
    return '<div id="'+controlId+'" class="expanderControl">'+
        '<div class="expanderhead">'+
            '<span class="expanderbutton">'+
                'x'+
            '</span>'+
            '<span class="expandertext">'+
            '</span>'+
        '</div>'+
        '<div class="expanderbody">'+
        '</div>'+
    '</div>';  
};


// tab control	
d3.select('#export_btn').on("click",function(){
	d3.selectAll('#export_panel, #detail_panel').style("display","none");
	d3.select('#export_panel').style("display",null);
});
d3.select('#detail_btn').on("click",function(){
	d3.selectAll('#export_panel, #detail_panel').style("display","none");
	d3.select('#detail_panel').style("display",null);
});
	
// close Popupmeu	
d3.select('#closepopupmenu').on("click", function () {
    d3.select('#popup_menu').style("display", "none");
});

//keyword paramter
var dataParameter = {};

	
var storeDetailsForShorttime = {};	
//get results
d3.select('#gotoresults').on("click", function () {
	//start search with asynchronous call.
	
	
	var query_terms = dataParameter.text.split(' ');
	var query = [];
	for (var i = 0; i < query_terms.length; i++) {
		var tmp = {
			weight: 1,
			text: query_terms[i]
		};
		query.push(tmp);
	}
	EEXCESS.callBG({
		method: {parent: 'model', func: 'query'}, data:query //data: [{weight:1,text:dataParameter.text}]
	});
	d3.select('#popup_menu').style("display", "none");
});
//search finished with results, asynchronous call
EEXCESS.messageListener(
	function(request, sender, sendResponse) {
		if (request.method === 'newSearchTriggered') {
			console.log(request.data);
			var maxResultOutput = $("#results_per_keywords").val();
			
			Object.keys(request.data.results.results).forEach(function(arrayIndex){
				//console.log("loadrsult: " + arrayIndex);
				if(parseInt(arrayIndex) < parseInt(maxResultOutput)){
					var text="";
					linecount++
					text = request.data.results.results[arrayIndex].title;
					storeDetailsForShorttime[request.data.results.results[arrayIndex].uri] = request.data.results.results[arrayIndex];

					g.build.addNodeWithLink(dataParameter.nodeId,"ResultId"+linecount,"listId"+linecount);
					var paramData ={
						text:text,
						nodeId:"ResultId"+linecount,
						currentKey:request.data.results.results[arrayIndex].uri
						};
					//var paramData ={
					//	currentKey:result,
					//	keyword:keyword
					//};
					g.build.setNodeProperties("ResultId"+linecount,{
						"nodeGraph":{xscale:2,yscale:2,fill:"orange"},
						"nodeD3":{text:TextCutter(text,10,9),title:text},
						"nodeEvents":{"contextmenu":{name:"MakePopupMenu","param":JSON.stringify(paramData)}}
					}); 
					g.build.setLinkProperties("listId"+linecount,{
						"linkD3":{width:2,distance:75},
						"linkGraph":{stroke:"yellow"}
					}); 
				}
			});
			g.build.show.restart();
			
		}
	}
);


//get details
d3.select('#gotodetails').on("click", function () {
	ClearDetailData();

	if(dataParameter.hasOwnProperty("result_details")){
		$("#title_data").val(dataParameter.text);
	}else{
		var detailData = storeDetailsForShorttime[dataParameter.currentKey];
		//console.log(detailData);
		
		$("#title_data").val(detailData.title);
		$("#link_data").text(detailData.uri).attr("href",detailData.uri);//.val(TextCutter(detailData.uri,20,19));
		$("#image_data").attr("src",detailData.previewImage);
		$("#id_data").text(detailData.id);
		
		$("#language_data").text(detailData.facets.language);
		$("#partner_data").text(detailData.facets.partner);
		$("#provider_data").text(detailData.facets.provider);
		$("#type_data").text(detailData.facets.type);
		$("#year_data").text(detailData.facets.year);
	}
	

	d3.select('#popup_menu').style("display", "none");
});




//clear data
d3.select('#cleardata').on("click", function () {
	ClearDetailData();
});

function ClearDetailData(){
	$("#title_data").val("");
	$("#link_data").text("").attr("href","");
	$("#image_data").attr("src","");
	$("#id_data, #language_data, #partner_data, #provider_data, #type_data, #year_data").text("");
};

var CurrentTagAction = function(e,func){

    if(e.relatedTarget == null){
        func();
    }else{

        if($(e.relatedTarget).closest("#"+e.currentTarget.id).length == 0){
            func();
        }
    }
};


// Event function
var functions = {
	TestFunc:function(){
		console.log("ASDF");
	},
	MouseIn:function(paramData){
		//d3.event.preventDefault();
		//d3.event.stopPropagation();
		CurrentTagAction(d3.event,function(){
		    console.log("MI");
			g.build.setNodeProperties("metanodeid_"+paramData,{
				"nodeGraph":{fill:"purple"}
			}); 
			g.build.show.restart();
			$("#metadataId_"+paramData+" > .expanderhead > .expanderbutton").css("background-color","purple");
		});
		
	},
	MouseOut:function(paramData){
		//d3.event.preventDefault();
		//d3.event.stopPropagation();
		CurrentTagAction(d3.event,function(){
		    console.log("MO");
			g.build.setNodeProperties("metanodeid_"+paramData,{
				"nodeGraph":{fill:"lightblue"}
			}); 
			g.build.show.restart();
			
			$("#metadataId_"+paramData+" > .expanderhead > .expanderbutton").css("background-color","lightblue");
		});
		
		console.log("MO -- ");
	},
	MakePopupMenu:function(paramData){
		//console.log(paramData);
		if (d3.event.pageX || d3.event.pageY) {
			var x = d3.event.pageX;
			var y = d3.event.pageY;
		} else if (d3.event.clientX || d3.event.clientY) {
			var x = d3.event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			var y = d3.event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}

		d3.select('#popup_menu')
			.style('position', 'absolute')
			.style('left', x + 'px')
			.style('top', y + 'px')
			.style('display', 'block');

			
		d3.event.preventDefault();
		dataParameter = JSON.parse(paramData);
		if(dataParameter.hasOwnProperty("result_details")){
			$("#gotoresults").css("display","none");
			$("#gotodetails").text("title"); 
		}
		else{
			$("#gotoresults").css("display","");
			$("#gotodetails").text("details"); 
		}
	}
};
	


// rebuild graph
$("#redraw").click(function(){
	$("#tree_view *").remove();
	exportMetadataPerJson = {};
	$("#metanodeselect *").remove()

	wordsWithResults = {};
	wordHistory = [];
	uniqueWordsResult =[];

	db.onsuccess();
	
});



//only demo
var exportMetadataPerJson = {};

d3.select('#deletemetanode').on("click", function () {
	var nodeName = $("#metanodeselect").val();
	g.build.deleteNode("metanodeid_"+nodeName)
	g.build.show.restart();
	
	//delete Metadata Node
	$("#metadataId_"+nodeName).remove();
	delete exportMetadataPerJson[nodeName];
	
	$("#metanodeselect > option[value='"+nodeName+"']").remove();
	d3.select('#popup_menu').style("display", "none");
});

d3.select('#workmetalink').on("click", function () {
	var work = $("#addordeletemetalink").val();
	var nodeName = $("#metanodeselect").val();
	if(work == "+"){
		g.build.addLink("metalinkid_"+dataParameter.nodeId+"_"+nodeName,
			dataParameter.nodeId,"metanodeid_"+nodeName);
		g.build.setLinkProperties("metalinkid_"+dataParameter.nodeId+"_"+nodeName,{
			"linkD3":{distance:100,strength:0},
			"linkGraph":{stroke:"black"}});	
		g.build.show.restart();
		
		//generate nested expanders
		///////////////////////////
		AddResultInTreeView(dataParameter,nodeName);
		
	}else if(work == "x"){
		g.build.deleteLink("metalinkid_"+dataParameter.nodeId+"_"+nodeName)
		g.build.show.restart();
		
		//delete Metadata Node
		//$("#metadataId_"+nodeName).remove();
		$("#metaresultId_"+nodeName + "_" +MD5(dataParameter.nodeId)).remove();
		delete exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)];
		/*
		if(dataParameter.hasOwnProperty("keyword")){
		}else{
		}
		*/
	}
	d3.select('#popup_menu').style("display", "none");
});


d3.select('#addmetanode').on("click", function () {
	//console.log(dataParameter);//.nodeid
	var nodeName = $("#metanodename").val();

	g.build.addNodeWithLink(dataParameter.nodeId,"metanodeid_"+nodeName,
		"metalinkid_"+dataParameter.nodeId+"_"+nodeName);
	g.build.setNodeProperties("metanodeid_"+nodeName,{
		"nodeGraph":{xscale:7,yscale:7,fill:"lightblue",stroke:"grey","stroke-width":4},
		"nodeD3":{title:nodeName,text:TextCutter(nodeName,10,9)},
		"nodeEvents":{
			"mouseout":{name:"MouseOut",param:nodeName},
			"mouseover":{name:"MouseIn",param:nodeName}
		}
		
	}); 

	g.build.setLinkProperties("metalinkid_"+dataParameter.nodeId+"_"+nodeName,{
		"linkD3":{distance:100,strength:0},
		"linkGraph":{stroke:"black"}});

	var differentElement = true;
	$("#metanodeselect > option").each(function(index,element){
		//console.log($(element).val());
		if(nodeName == $(element).val()){
			differentElement = false;
		}
	});
	if(differentElement){
		$("#metanodeselect").append('<option value="'+nodeName+'">'+nodeName+'</option>');
		
		g.build.show.restart();

		$("#metanodename").val("");
		d3.select('#popup_menu').style("display", "none");
		
		
		//generate nested expanders
		///////////////////////////
		//metadata node
		exportMetadataPerJson[nodeName] ={};
		
		$("#tree_view").append(GenerateExpander("metadataId_"+nodeName));
		$("#metadataId_"+nodeName).css("border","1px solid grey");
		$("#metadataId_"+nodeName+" > .expanderhead > .expandertext").text(nodeName);
		$("#metadataId_"+nodeName+" > .expanderhead > .expanderbutton").css("border","1px solid black");
		$("#metadataId_"+nodeName+" > .expanderhead > .expanderbutton").css("background-color","lightblue");	
		$("#metadataId_"+nodeName+" > .expanderhead").mouseover(function(){
			$("#metadataId_"+nodeName+" > .expanderhead > .expanderbutton").css("background-color","purple");
			g.build.setNodeProperties("metanodeid_"+nodeName,{
				"nodeGraph":{fill:"purple"}
			}); 
			g.build.show.restart();
		}).mouseout(function(){
			$("#metadataId_"+nodeName+" > .expanderhead > .expanderbutton").css("background-color","lightblue");
			g.build.setNodeProperties("metanodeid_"+nodeName,{
				"nodeGraph":{fill:"lightblue"}
			}); 
			g.build.show.restart();
		});
		GetExpanderFunction("#metadataId_"+nodeName);
		AddResultInTreeView(dataParameter,nodeName );
		
	}

});


//generate nested expanders
///////////////////////////
function AddResultInTreeView(dataParameter,nodeName){

	//metadata result
	var md5MetaResult = nodeName + "_" + MD5(dataParameter.nodeId);
	exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)] ={};
	exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["allresults"] ={};
	
	if(dataParameter.hasOwnProperty("keyword")){
		////metadata result
		//var md5MetaResult = nodeName + "_" + MD5(dataParameter.nodeId);
		exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["data"] ={
			"result":dataParameter.text,"query":dataParameter.keyword
		};		
		
		$("#metadataId_"+nodeName +" > .expanderbody").append(GenerateExpander("metaresultId_" +md5MetaResult));
		$("#metaresultId_"+md5MetaResult+" > .expanderhead > .expandertext").text(
			"result: " + TextCutter(dataParameter.text,20,19) /*+
			" query: " + TextCutter(dataParameter.keyword,10,9) */);
		//exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)] ={};

		//exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["allresults"] ={};
		
		$("#metaresultId_"+md5MetaResult+" > .expanderhead").attr(
			"title","result: " + dataParameter.text /*+ " || " + " query: " + dataParameter.keyword*/);
		$("#metaresultId_"+md5MetaResult+" > .expanderhead > .expanderbutton").css("background-color","gold");	
		$("#metaresultId_"+md5MetaResult+" > .expanderhead > .expanderbutton").text("o");	
		GetExpanderFunction("#metaresultId_"+md5MetaResult);
		$("#metaresultId_"+md5MetaResult+" > .expanderbody").css("display","none");
		$("#metaresultId_"+md5MetaResult+" .expanderbutton").off("click");
		
		/*
		//metadata allresults
		var resultObjects = wordsWithResults[dataParameter.keyword].results;
		var md5MetaAllResults = null;
		
		//exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["allresults"] ={};
		
		Object.keys(resultObjects).forEach(function(key,index){
			exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["allresults"][index] = 
				resultObjects[key].title;	
				
			md5MetaAllResults = MD5(resultObjects[key].title);

			$("#metaresultId_"+md5MetaResult + " > .expanderbody").append(GenerateExpander("metaallresultId_"+md5MetaAllResults));
			$("#metaallresultId_"+md5MetaAllResults+" > .expanderhead > .expandertext").text(
				TextCutter(resultObjects[key].title,30,29));
			$("#metaallresultId_"+md5MetaAllResults+" > .expanderhead")
				.attr("title",resultObjects[key].title);
			$("#metaallresultId_"+md5MetaAllResults+" > .expanderbody").css("display","none");
			$("#metaallresultId_"+md5MetaAllResults+" .expanderbutton").css("display","none");
			
		});
		*/
		
	}else{
		////metadata result
		//var md5MetaResult = nodeName + "_" + MD5(dataParameter.nodeId);
		exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["data"] ={
			"query":dataParameter.text
		};	
		$("#metadataId_"+nodeName + " > .expanderbody").append(GenerateExpander("metaresultId_"+md5MetaResult));
		$("#metaresultId_"+md5MetaResult+" > .expanderhead > .expandertext").text(
			"query: " + TextCutter(dataParameter.text,20,19) );
		$("#metaresultId_"+md5MetaResult+" > .expanderhead").attr(
			"title",dataParameter.text);
		$("#metaresultId_"+md5MetaResult+" > .expanderhead > .expanderbutton").css("background-color","lightgreen");	
		GetExpanderFunction("#metaresultId_"+md5MetaResult);
		
		//metadata allresults
		var resultObjects = wordsWithResults[dataParameter.text].results;
		var md5MetaAllResults = null;
		Object.keys(resultObjects).forEach(function(key,index){
			exportMetadataPerJson[nodeName]["result:"+MD5(dataParameter.nodeId)]["allresults"][index] = 
				resultObjects[key].title;	
				
			md5MetaAllResults = MD5(resultObjects[key].title);
			$("#metaallresultId_"+md5MetaAllResults).css("border","1px dashed lightgrey;");
			$("#metaresultId_"+md5MetaResult + " > .expanderbody").append(GenerateExpander("metaallresultId_"+md5MetaAllResults));
			$("#metaallresultId_"+md5MetaAllResults+" > .expanderhead > .expandertext").text(
				TextCutter(resultObjects[key].title,30,29));
			$("#metaallresultId_"+md5MetaAllResults+" > .expanderhead").attr("title",resultObjects[key].title);
			$("#metaallresultId_"+md5MetaAllResults+" > .expanderbody").css("display","none");
			$("#metaallresultId_"+md5MetaAllResults+" .expanderbutton").css("display","none");
		});
	}
	
	
};

//export metadata
$("#exportmetadata").click(function(){
	window.URL = window.URL || window.webkitURL;

	var logString = JSON.stringify(exportMetadataPerJson);//.join("\r\n");
	var downloadBlob = new Blob([logString], {type: 'text/plain'});

	$("#exportmetadata").attr("href", window.URL.createObjectURL(downloadBlob));
	$("#exportmetadata").attr("download", "metadata.txt");

});


//Data for Belgin////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//getdata from database
$("#getdata").click(function(){
	window.URL = window.URL || window.webkitURL;

	var logString = JSON.stringify(getData);//.join("\r\n");
	var downloadBlob = new Blob([logString], {type: 'text/plain'});

	$("#getdata").attr("href", window.URL.createObjectURL(downloadBlob));
	$("#getdata").attr("download", "logdata.txt");

});



//get current data
var getData = {};
EEXCESS.callBG(	{
		method: {
			parent: 'model', 
			func: 'getResults'
		},
		data: null
	}, 
	function(reqResult) {
		//alert("test X");
		//console.log("- - - - -");
		//console.log(reqResult);
		getData = reqResult;
	});



