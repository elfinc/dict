var doc = document, body = doc.body;

var words = Object.keys(wordMeaning);

var search = (() => {
  var curIndex = 0;
  var curText = '';
  var curKeywords = [];
  var init = (text) => {
    curIndex = 0;
    curText = text;
    curKeywords = text.split(/\s+/);
  }
  var search = (text, count) => {
    var res = { txt: [], end: false };
    if (text !== curText) {
      init(text);
    }
    while (count > 0) {
      var word = next(text);
      if (word) {
        res.txt.push({ word, mean: wordMeaning['$' + word] });
        count--;
      }
      if (curIndex >= words.length) {
        res.end = true;
        break;
      }
    }
    return res;
  }
  var next = (text) => {
    var word = words[curIndex].slice(1);
    var target = word;
    var i = 0;
    do {
      target = split(target, curKeywords[i]);
      i++;
    }
    while (target && curKeywords[i]);
    curIndex++;
    if (target != null) return word;
  }
  var split = (word, keyword) => {
    var index = word.indexOf(keyword);
    if (index >= 0) {
      return word.slice(index + keyword.length);
    }
  }
  return search;
})();

var curText = '';
var inputer = doc.getElementsByTagName('input')[0];
inputer.oninput = (e) => {
  var text = inputer.value.trim();
  if (text != curText) {
    dicts.innerHTML = '';
    curText = text;
    var res;
    do {
      res = search(text, 10);
      appText(res.txt);
    }
    while (!res.end && body.clientHeight < window.innerHeight);
  }
}

var dicts = doc.getElementById('dicts');
var appText = (vals) => {
  var frag = doc.createDocumentFragment();
  vals.forEach(v => {
    var word = doc.createElement('td');
    word.className = 'word';
    word.innerText = v.word;
    var mean = doc.createElement('td');
    mean.className = 'mean';
    mean.innerText = v.mean;
    var p = doc.createElement('tr');
    p.appendChild(word);
    p.appendChild(mean);
    frag.appendChild(p);
  });
  dicts.appendChild(frag);
}

window.onscroll = (e) => {
  if (body.scrollTop + body.clientHeight == body.scrollHeight) {
    var res = search(curText, 2);
    appText(res.txt);
  }
}