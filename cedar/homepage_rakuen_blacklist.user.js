// ==UserScript==
// @name        首页热门条目与小组讨论屏蔽
// @namespace   tv.bgm.cedar.homepagerakuenblacklist
// @version     1.0
// @description 根据指定关键词或ID屏蔽首页热门条目与小组讨论
// @author      Cedar
// @include     /^https?://((bangumi|bgm)\.tv|chii\.in)/$/
// @include     /^https?://((bangumi|bgm)\.tv|chii\.in)/rakuen.*$/
// @include     /^https?://((bangumi|bgm)\.tv|chii\.in)/settings/privacy$/
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle(`
#homepage-rakuen-blacklist .inputBtn+span {
	display: inline-block;
	width: 16px;
	height: 8px;
	border: 5px solid limegreen;
	border-top: none;
	border-right: none;
	transform: rotate(-45deg);
}
`);

  if (location.pathname == "/settings/privacy") {
    let formtable =
`<form id="homepage-rakuen-blacklist">
<table style="margin:auto; width:98%" class="settings">
<thead>
<tr><td colspan="2" style="text-align:left"><h2 class="subtitle">首页热门条目与小组讨论屏蔽</h2></td></tr>
<tr><td style="width:10%">屏蔽内容</td><td style="width:90%">ID或关键词</td></tr>
</thead>
<tbody>
<tr>
<td>小组ID</td>
<td><input name="groupIDs" class="inputtext" type="text" value=${blacklist.groupIDs || ""}></td>
</tr>
<tr>
<td>小组标题</td>
<td><input name="groupTitleKeywords" class="inputtext" type="text" value=${blacklist.groupTitleKeywords || ""}></td>
</tr>
<tr>
<td>条目ID</td>
<td><input name="subjectIDs" class="inputtext" type="text" value=${blacklist.subjectIDs || ""}></td>
</tr>
<tr>
<td>条目标题</td>
<td><input name="subjectTitleKeywords" class="inputtext" type="text" value=${blacklist.subjectTitleKeywords || ""}></td>
</tr>
<tr>
<td colspan="2"><input class="inputBtn" type="button" style="margin-right: 5px" value="保存"><span style="display:none"></span></td>
<td></td>
</tr>
</tbody>
</table>
</form>`

    $(formtable).appendTo(document.getElementById("columnA"));

    let form = document.getElementById('homepage-rakuen-blacklist');
    form.getElementsByClassName("inputBtn")[0].addEventListener("click", function() {
      // 下方代码含义: 把 [["key1", "value1 value2"], ["key2", "value3 value4"]] 变为 {"input1": ["value1", "value2"], "input2": ["value3", "value4"]}
      blacklist = Array.from(new FormData(form)).reduce((m, x) => Object.assign( m, {[x[0]]: x[1].split(/[, ]+/).filter(x => x.length)} ), {});
      localStorage[storageKey] = JSON.stringify(blacklist);
      $(this.nextElementSibling).fadeIn("fast").fadeTo(300, 1).fadeOut("slow");
    });
    return;
  }

  function filterItems(elemList, elemParser, keywordList, strictMode=false) {
    // elemParser should return a string.
    for (let e of elemList) {
      const s = elemParser(e);
      if (keywordList.some(strictMode? (k => s === k): (k => s.includes(k))))
        e.style.display = "none";
    }
  }

  let group, subject;
  let idParser, titleParser;

  if (location.pathname == "/") {
    group   = document.querySelectorAll('#home_grp_tpc .sideTpcList>:not(.tools)');
    subject = document.querySelectorAll('#home_subject_tpc .sideTpcList>li');

    idParser    = e => e.querySelector('p a').href.split('/').pop();
    titleParser = e => e.querySelector('.inner>a').innerHTML;
  }
  else if (location.pathname.startsWith("/rakuen")) {
    group   = document.querySelectorAll('[id^="item_group_"]');
    subject = document.querySelectorAll('[id^="item_subject_"]');

    idParser    = e => e.querySelector('.row>a').href.split('/').pop();
    titleParser = e => e.querySelector('.inner>a').innerHTML;
  }

  // group
  filterItems(group, idParser, blacklist.groupIDs || [], true);
  filterItems(group, titleParser, blacklist.groupTitleKeywords || []);
  // subject
  filterItems(subject, idParser, blacklist.subjectIDs || [], true);
  filterItems(subject, titleParser, blacklist.subjectTitleKeywords || []);
})();
