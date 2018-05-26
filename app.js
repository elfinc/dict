var doc = document, body = doc.body;

var wordList = Object.keys(wordMeaning);

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
    while (count > 0 && curIndex < wordList.length) {
      var word = next();
      if (word) {
        res.txt.push({ words: word.words, mean: wordMeaning['$' + word.word] });
        count--;
      }
      curIndex++;
      if (curIndex >= wordList.length) {
        res.end = true;
        break;
      }
    }
    return res;
  }
  var next = () => {
    var word = wordList[curIndex].slice(1);
    var splitWord = [];
    var keywordCount = curKeywords.length;
    var inFirst = curKeywords[keywordCount - 1] === '';
    var inLast = curKeywords[0] === '';
    var check = 0;
    var remainWord = word;
    for (var key = 0; key < keywordCount; key++) {
      var keyword = curKeywords[key];
      if (keyword === '') {
        check++;
        continue;
      }
      var keyIndex = remainWord.indexOf(keyword);
      if (keyIndex >= 0) {
        if (inFirst && key === +inLast && keyIndex !== 0 ||
          inLast && key === keywordCount - 1 - inFirst &&
          remainWord.length - keyIndex - keyword.length !== 0) {
          break;
        }
        check++;
        if (keyIndex > 0) {
          splitWord.push({
            text: remainWord.slice(0, keyIndex),
            light: false,
          });
        }
        splitWord.push({
          text: remainWord.slice(keyIndex, keyIndex + keyword.length),
          light: true,
        });
        remainWord = remainWord.slice(keyIndex + keyword.length);
      }
      else {
        break;
      }
    }
    splitWord.push({
      text: remainWord,
      light: false,
    });
    if (check === keywordCount) return { word, words: splitWord };
  }
  return search;
})();

var inputer = doc.getElementsByTagName('input')[0];
var curText = inputer.value = decodeURI(self.location.hash).slice(1);

inputer.oninput = (e) => {
  var text = inputer.value.split(/\s+/).join(' ');
  if (text != curText) {
    dicts.innerHTML = '';
    curText = text;
    self.location.hash = text;
    start(text);
  }
}

var start = (text) => {
  var res;
  do {
    res = search(text, 10);
    appText(res.txt);
  }
  while (!res.end && body.clientHeight < window.innerHeight);
}

var dicts = doc.getElementById('dicts');
var appText = (vals) => {
  var frag = doc.createDocumentFragment();
  vals.forEach(v => {
    var word = doc.createElement('td');
    word.className = 'word';
    var n = 0;
    v.words.forEach(w => {
      var text = doc.createElement('span');
      text.innerText = w.text;
      if (w.light) {
        text.className = 'light';
        text.style.background = 'hsl(' + (360 - (n * 60 + 90) % 360) + ',100%,80%)';
        n++;
      }
      word.appendChild(text);
    });
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

start(curText);

function getScrollTop() {
  var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
  if (document.body) {
    bodyScrollTop = document.body.scrollTop;
  }
  if (document.documentElement) {
    documentScrollTop = document.documentElement.scrollTop;
  }
  scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
  return scrollTop;
}
function getScrollHeight() {
  var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
  if (document.body) {
    bodyScrollHeight = document.body.scrollHeight;
  }
  if (document.documentElement) {
    documentScrollHeight = document.documentElement.scrollHeight;
  }
  scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
  return scrollHeight;
}
function getWindowHeight() {
  var windowHeight = 0;
  if (document.compatMode == "CSS1Compat") {
    windowHeight = document.documentElement.clientHeight;
  } else {
    windowHeight = document.body.clientHeight;
  }
  return windowHeight;
}

self.onresize = self.onscroll = () => {
  if (getScrollTop() + getWindowHeight() - getScrollHeight() > -100) {
    var res = search(curText, 10);
    appText(res.txt);
  }
}