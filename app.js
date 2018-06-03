var doc = document, body = doc.body;

var wordList = Object.keys(wordMeaning);
wordList.forEach(word => {
  var mean = wordMeaning[word];
  var synonym = mean.split('=')[1];
  if (synonym) {
    synonym = synonym.split(' ')[0];
    _mean = wordMeaning[synonym];
    if (_mean) {
      wordMeaning[word] = mean + '\n' + synonym + ': ' + _mean;
    }
  }
});

var search = (() => {
  var curIndex = 0;
  var curText = '';
  var curKeywords = [];
  var accuKeywords = [];
  var init = (text) => {
    curIndex = 0;
    curText = text;
    curKeywords = text.split(' ');
    accuKeywords.length = 0;
    curKeywords.forEach(k => {
      if (wordMeaning[k] && accuKeywords.indexOf(k) < 0) {
        accuKeywords.push(k);
      }
    });
  }
  var search = (text, count) => {
    var res = { txt: [], end: false };
    if (text !== curText) {
      init(text);
    }
    while (count > 0 && curIndex < wordList.length) {
      var word;
      if (curIndex < accuKeywords.length) {
        var t = accuKeywords[curIndex];
        word = {
          words: [{ text: t, light: true }],
          means: accu(t),
          index: curIndex
        }
      }
      else {
        word = next(curIndex - accuKeywords.length);
      }
      if (word) {
        res.txt.push(word);
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
  var next = (index) => {
    var word = wordList[index];
    var mean = wordMeaning[word];
    var splitWord = [];
    var splitMean = [];
    var keywordCount = curKeywords.length;
    var inFirst = curKeywords[keywordCount - 1] === '';
    var inLast = curKeywords[0] === '';
    var check = 0;
    var remainWord = word;
    var remainMean = mean;
    var keyNum = inLast ? -1 : 0;
    for (var key = 0; key < keywordCount; key++) {
      var keyword = curKeywords[key];
      // 首尾空字符
      if (keyword === '') {
        check++;
        continue;
      }
      // 判断单词完全相等
      else if (keyword === word) {
        check = Infinity;
        keyNum += key;
        // 匹配字母
        splitWord = [{
          text: word,
          light: true,
        }];
        remainWord = '';
        continue;
      }
      // 关键字全英文 检索单词
      else if (/^[a-zA-Z]+$/.test(keyword) && isFinite(check)) {
        var keyIndex = remainWord.indexOf(keyword);
        if (keyIndex >= 0) {
          // 以首尾字母判断
          if (inFirst && key === +inLast && keyIndex !== 0 ||
            inLast && key === keywordCount - 1 - inFirst &&
            remainWord.length - keyIndex - keyword.length !== 0) {
            break;
          }
          check++;
          if (keyIndex > 0) {
            // 略过字母
            splitWord.push({
              text: remainWord.slice(0, keyIndex),
              light: false,
            });
          }
          // 匹配字母
          splitWord.push({
            text: remainWord.slice(keyIndex, keyIndex + keyword.length),
            light: true,
          });
          remainWord = remainWord.slice(keyIndex + keyword.length);
        }
        else {
          check--;
        }
        continue;
      }
      // 关键字含其他字符 检索翻译
      else {
        var keyIndex = remainMean.indexOf(keyword);
        if (keyIndex >= 0) {
          check++;
          if (keyIndex > 0) {
            splitMean.push({
              text: remainMean.slice(0, keyIndex),
              light: false,
            });
          }
          splitMean.push({
            text: remainMean.slice(keyIndex, keyIndex + keyword.length),
            light: true,
          });
          remainMean = remainMean.slice(keyIndex + keyword.length);
        }
        else {
          break;
        }
        continue;
      }
    }
    if (check >= keywordCount) {
      // 补全检索
      if (remainWord) splitWord.push({
        text: remainWord,
        light: false,
      });
      if (remainMean) splitMean.push({
        text: remainMean,
        light: false,
      });
      return {
        words: splitWord,
        means: splitMean,
        index: keyNum,
        bingo: !isFinite(check)
      };
    }
  }
  var accu = text => {
    var remainMean = wordMeaning[text];
    var splitMean = [];
    curKeywords.forEach(k => {
      if (k === '') return;
      var keyIndex = remainMean.indexOf(k);
      if (keyIndex >= 0) {
        if (keyIndex > 0) {
          splitMean.push({
            text: remainMean.slice(0, keyIndex),
            light: false,
          });
        }
        splitMean.push({
          text: remainMean.slice(keyIndex, keyIndex + k.length),
          light: true,
        });
        remainMean = remainMean.slice(keyIndex + k.length);
      }
    });
    if (remainMean) splitMean.push({
      text: remainMean,
      light: false,
    });
    return splitMean;
  }
  return search;
})();

var isplit = s =>
  s.split(/[,|\.|:]/).join(' ').split(/\s+/);


var inputer = doc.getElementsByTagName('input')[0];
var tips = doc.querySelector('#tips>span');
var curText = tips.innerHTML = inputer.value = isplit(decodeURI(self.location.hash).slice(1)).join(' ').toLowerCase();
if (curText[0] == ' ') tips.classList.add('b');
if (curText[curText.length - 1] == ' ') tips.classList.add('a');
var keywords = curText.trim().split(' ');

inputer.oninput = (e) => {
  var text = isplit(inputer.value).join(' ');
  var iinput = inputer.value.split(/\s+/).join(' ');
  if (inputer.value !== iinput) {
    inputer.value = iinput;
  }
  tips.innerHTML = inputer.value;
  text = text.toLowerCase();
  tips.className = '';
  if (text[0] == ' ') tips.classList.add('b');
  if (text[text.length - 1] == ' ') tips.classList.add('a');
  if (text != curText) {
    keywords = text.trim().split(' ');
    curText = text;
    self.location.hash = text;
    start(text, true);
  }
}

var waitHandler = { t: null, a: null };
var start = (text, isNew) => {
  clearTimeout(waitHandler.t);
  cancelAnimationFrame(waitHandler.a);
  waitHandler.t = setTimeout(() => {
    waitHandler.a = requestAnimationFrame(function () {
      if (isNew) {
        dicts.innerHTML = '';
      }
      var res;
      do {
        res = search(text, 10);
        appText(res.txt);
      }
      while (!res.end && body.clientHeight < window.innerHeight);
    });
  }, 50);
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
        text.style.background = 'hsl(' + (360 - ((n + v.index) * 60 + 90) % 360) + ',100%,80%)';
        n++;
      }
      word.appendChild(text);
    });
    var mean = doc.createElement('td');
    mean.className = 'mean';
    v.means.forEach(m => {
      var text = doc.createElement('span');
      text.innerText = m.text;
      if (m.light) {
        text.className = 'light';
        text.style.background = 'hsl(' + (360 - (n * 60 + 90) % 360) + ',100%,80%)';
        n++;
      }
      mean.appendChild(text);
    });
    var p = doc.createElement('tr');
    p.appendChild(word);
    p.appendChild(mean);
    if (!v.bingo) frag.appendChild(p);
  });
  dicts.appendChild(frag);
}

start(curText, true);

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