"use strict"
const APIURL = './music.json';
let musicList = document.getElementById('musicdata');

const HtmlSanitizeRegex = /<\/?[^>]+(>|$)/g;
const keys = ["title", "description", "keywords"];
let timerId;
let expanded = false;

function showCheckboxes() {
  const checkboxes = document.getElementById("checkboxes");
  if (!expanded) {
    checkboxes.style.display = "block";
    expanded = true;
  } else {
    checkboxes.style.display = "none";
    expanded = false;
  }
}

const searchData = async () => {
  let searchKeyword = document.getElementById('keyword').value.toLowerCase().trim();
  
  const markedCheckbox = document.querySelectorAll('input[type="checkbox"]:checked');
  const selectedKey = [...markedCheckbox].map(option => option.value);  
  
  const searchKey = selectedKey.length > 0 && !selectedKey.includes('all') ? selectedKey : keys;
  const data = await getData(true);
  if(searchKeyword === '') {
    attachData({ data, fromSearch: true });
    return false;
  };
  searchKeyword = searchKeyword.split(" ");
  
  const filteredData = Object.values(data).filter((row) => {
    return searchKey.some((key) => {
      const currSearch = row[key]
        .toString()
        .replace(HtmlSanitizeRegex, "")
        .toLowerCase();
      return searchKeyword.some((each) => currSearch.includes(each));
    });
  });
  const highlightedData = highlightSearchKeyword({ filteredData, searchKeyword });
  attachData({ data: highlightedData, fromSearch: true });

}

const highlightRegex = searchKeyword => new RegExp("(" + searchKeyword.join("|") + ")", "gim");
const highlightSearchKeyword = ({ filteredData, searchKeyword }) => {
  const replacement = "<mark>$1</mark>";
  const highlightedData = filteredData.map((row) => {
    let resRow = row;
    keys.forEach((key) => {
      if (key === "title") {
        resRow[key] = replaceWithRegex(
          row[key],
          highlightRegex(searchKeyword),
          replacement
        );
      } else {
        resRow[key][0] = replaceWithRegex(
          row[key][0],
          highlightRegex(searchKeyword),
          replacement
        );
      }
    });
    return resRow;
  });

  return highlightedData;
};

const replaceWithRegex = (value,re,replacement) => value.replace(re, replacement);


const attachData = ({data, fromSearch}) => {
  if(fromSearch) {
    musicList.innerHTML = '';
  }
  const nodes = Object.values(data).map((item) => {
    let musicdata = 
      `<div class="cardWrapper">
        <div class="imagewrapper">
          <img src="music.png" alt="music" class="image" id="image" >
        </div>
        <div class="musicdetails">
          <div class=title>${item.title}</div>
          <div class="duration">${item.supplement_information[0]}</div>
          <div class="description">${item.description[0]}</div>
          <div class="playsong">play Song</div>
          <div class="songfile">Song File</div>
        </div>
      </div>`;
      musicList.insertAdjacentHTML('beforeend', musicdata);
  });
}
  
  
/*
  fetch data from the json file on page load.
*/
const getData = async (forSearch = false) => {
  try {
    const response = await (await fetch(APIURL)).json();
    if(forSearch) {
      return response.sections[0].assets;
    }
    else {
      attachData({ data: response.sections[0].assets, fromSearch: false });
    }
  }
  catch(error) {
    console.log('Error. =>', error);
  }
  
}

getData();

const debounceFunction  =  function (func, delay) {
	// Cancels the setTimeout method execution
	clearTimeout(timerId)
	// Executes the func after delay time.
	timerId  =  setTimeout(func, delay)
}

const handleCheckbox = (option) => {
  const checkboxes = document.getElementsByName('options');
  for(var i=0; i<checkboxes.length; i++){  
    checkboxes[i].checked=option;  
  }  
};

const handleAllOption = () => { 
  const markedCheckbox = document.querySelectorAll('input[name="options"]:checked');
  if(markedCheckbox.length === 3) {
    document.getElementById('alloption').checked = true;
  }
  else {
    document.getElementById('alloption').checked = false;
  }
}

document.getElementById("search").addEventListener("click", searchData);

document.getElementById("keyword").addEventListener("keyup", function() {
  debounceFunction(searchData, 500)
});

document.getElementById("alloption").addEventListener("change", function() {
  if(this.checked) {
    handleCheckbox(true);
  } else {
    handleCheckbox(false)
  }
});;

const checkBoxOptions = document.getElementsByName("options");

for (let i = 0; i < checkBoxOptions.length; i++) {
  checkBoxOptions[i].addEventListener("change", handleAllOption)
}






