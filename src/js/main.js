// 検索リストDOM
const listSearchTitle = document.querySelector('.listTitles');
const searchTitle = document.querySelector('#target02');

// Rakuten kobo APIキー
const app_id = encodeURI('1060170081702903408');

// status 429 対策 wait[ms]
const WAIT_API = 250;
// 表示巻数 1:最新のみ
const SHOW_VOL = 3;
// !new badge
const NEW_BADGE = "New!";

// 作業領域
let urlRakutenKobo;
let objAll = [];
let objItem;

// コンストラクタ
createTitles();

/* -----------------------------------------------------
|  タイトル一覧の作成（起動時）
|  ----------------------------------------------------*/
function createTitles() {
    // ローカルストレージからタイトル一覧を取得 
    const comics = loadComics();

    // 検索タイトルの一覧を回す
    comics.forEach((element, index, array) => {
        addTitle_sub(element);
    });

}

/* -----------------------------------------------------
|  新規タイトルの追加
|  ----------------------------------------------------*/
function addTitle() {
    // 入力タイトル（追加対象の名前）
    let domInputTitle = document.querySelector(".inputTitle");
    const inputTitle = domInputTitle.value;
    let domTitleWrap = addTitle_sub(inputTitle);
    // newバッジ
    let domBadge = document.createElement("span");
    domBadge.className = "badge badge-pill badge-danger";
    domBadge.innerText =  NEW_BADGE;
    domTitleWrap.appendChild(domBadge);
}

/* -----------------------------------------------------
|  タイトル dom の作成
|  ----------------------------------------------------*/
function addTitle_sub(newTitle) {
    // 検索一覧の枠 .listTitles (HTMLに定義済み)
    let domTitles = document.querySelector(".listTitles");
    // 検索タイトル枠
    let domTitleWrap = document.createElement("div");
    domTitleWrap.id = `div${newTitle}`;
    domTitles.appendChild(domTitleWrap);
    // 追加タイトル（チェックボックス）
    let domAddTitle = document.createElement("input");
    domAddTitle.type = 'checkbox';
    domAddTitle.id = `target${newTitle}`;
    domAddTitle.className = 'target';
    domAddTitle.name = 'target';
    domAddTitle.value = newTitle;
    domAddTitle.checked = true;
    domTitleWrap.appendChild(domAddTitle);
    // 追加タイトル（ラベル）
    let domAddLabel = document.createElement("label");
    domAddLabel.id = `label${newTitle}`;
    domAddLabel.htmlFor = `target${newTitle}`;
    domAddLabel.innerText = newTitle;
    domTitleWrap.appendChild(domAddLabel);

    return domTitleWrap;
}

/* -----------------------------------------------------
|  既存タイトルの削除
|  ----------------------------------------------------*/
function rmvTitle() {
    // 入力タイトル（削除対象の名前）
    const domInputTitle = document.querySelector(".inputTitle");
    const inputTitle = domInputTitle.value;
    // 削除対象のチェックボックス
    let domRmvDiv = document.querySelector(`#div${inputTitle}`);
    let domRmvChkbox = document.querySelector(`#target${inputTitle}`);
    let domRmvChklbl = document.querySelector(`#label${inputTitle}`);
    // 検索一覧の枠 .listTitles (HTMLに定義済み)
    let domTitles = document.querySelector(".listTitles");
    domTitles.removeChild(domRmvDiv);
}

/* -----------------------------------------------------
|  チェックしたタイトル全てを検索
|  ----------------------------------------------------*/
function searchAll() {

    // 空の解決済みPromiseを生成(同期処理用)
    let promise = Promise.resolve();

    // 結果表示削除
    this.removeRes();
    // タイトル一覧 配列
    const titleAry = checkedGet(1); // 1:チェック済みタイトルのみ取得
    // 検索タイトルの一覧を回す
    titleAry.forEach(function (element, index, array) {
        let ms = 300;
        if (index % 2 == 0) {
            ms = 300;
        }
        // promiseにthenで繋ぎ再代入
        // これでどんどんthenをチェーンしていける
        promise = promise.then(() => runSearch(element, drawResult, ms));
    });

}

/* -----------------------------------------------------
|  １タイトルの検索 api実行
|  ----------------------------------------------------*/
function runSearch(title, funcDrawRes, ms) {
    const p = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        // 楽天API url
        urlRakutenKobo = `https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426?format=json&title=${title}&applicationId=${app_id}`;
        // オープン        
        xhr.open('GET', urlRakutenKobo);
        console.log(urlRakutenKobo);
        // リクエスト
        // xhr.send();
        // ４つ以上 リクエストすると 429 エラーの為 wait
        setTimeout(() => xhr.send(), ms);
        // レスポンス
        xhr.addEventListener('load', (e) => {
            // ステータスコード
            console.log(event.target.status);
            // json -> object データ
            objAll = JSON.parse(event.target.responseText);
            resolve(objAll); // 戻り値
            // 結果表示
            funcDrawRes(objAll);
        });
    });

    return p;
}

/* -----------------------------------------------------
|  結果の表示
|  ----------------------------------------------------*/
function drawResult(objAll) {

    // 最新巻と一巻前まで取得
    const objArray = objAll.Items.slice(0, SHOW_VOL);
    let objItems = [];
    objArray.forEach((element, index, array) => {
        objItems.push(element.Item);
    });
    // 検索結果全ての枠 .res-wrap (HTMLに定義済み)
    let domResWrap = document.querySelector(".res-wrap");
    // 作品毎の枠 .res-books
    let domResBooks = document.createElement("div");
    domResBooks.className = 'res-books';
    domResWrap.appendChild(domResBooks);

    // 各情報の枠
    let domResTitle = ''; // タイトル
    let domResAuthor = ''; // 作者
    let domResDate = ''; // 発売日
    let domResImg = ''; // イメージ

    objItems.forEach((element, index, array) => {
        // 各巻毎の枠 .res-book
        let domResBook = document.createElement("div");
        domResBook.className = 'res-book';
        domResBooks.appendChild(domResBook);
        // クリエイト
        let domResTitle = document.createElement("div");
        let domResAuthor = document.createElement("div");
        let domResDate = document.createElement("div");
        // クラス名
        domResTitle.className = 'res-title';
        domResAuthor.className = 'res-author';
        domResDate.className = 'res-date';
        // テキスト
        domResTitle.innerHTML = `${element.title}`;
        domResAuthor.innerHTML = `${element.author}`;
        domResDate.innerHTML = `${element.salesDate}`;
        domResBook.appendChild(domResTitle);
        domResBook.appendChild(domResAuthor);
        domResBook.appendChild(domResDate);
        // イメージ
        domResImg = document.createElement("img");
        domResImg.setAttribute("src", element.largeImageUrl);
        domResBook.appendChild(domResImg);
    });
}

/* -----------------------------------------------------
|  チェックボックス全てを☒☐
|  ----------------------------------------------------*/
function checkAll(string) {
    // input タグ全て取得
    let chk = document.getElementsByTagName('input');
    for (let i = 0; i < chk.length; i++) {
        if (chk[i].type == 'checkbox') {
            chk[i].checked = string;
        }
    }
}

/* -----------------------------------------------------
|  タイトルを取得
|  option -- 0:全てのタイトル  1:チェックされているタイトルのみ
|  ----------------------------------------------------*/
function checkedGet(option) {
    // タイトル一覧
    titles = listSearchTitle.innerText;
    const regExp = new RegExp(NEW_BADGE,'g') // 正規表現用 領域
    titles = titles.replace(regExp,''); // !New を削除
    const titlesAry = titles.split('\n');

    let chkTitles = [];
    // input dom 全て取得
    let inputTag = document.getElementsByTagName('input');
    let chkbox = [];
    // チェックボックス dom だけ選別
    for (let i = 0; i < inputTag.length; i++) {
        if (inputTag[i].type == 'checkbox') {
            chkbox.push(inputTag[i]);
        }
    }
    for (let i = 0; i < chkbox.length; i++) {
        if (option == 1) {
            // チェックされたタイトルのみ取得
            if (chkbox[i].checked == true) {
                chkTitles.push(titlesAry[i]);
            }
        } else {
            // 全てのタイトルを取得
            chkTitles.push(titlesAry[i]);
        }

    }
    return chkTitles;
}

/* -----------------------------------------------------
|  表示中の結果を削除する。
|  ----------------------------------------------------*/
function removeRes() {
    const stateResWrap = document.querySelector(".res-wrap");
    // 既に結果が表示されていたら
    if (stateResWrap != null) {
        // 子要素を全て削除
        while (stateResWrap.firstChild) {
            stateResWrap.removeChild(stateResWrap.firstChild);
        }
    }
}


function saveComics() {
    // タイトル取得
    let comics = checkedGet(0); // 0:チェック関係なしで全部
    
    //JSON.stringifyした上で、localStorageに保存します。
    localStorage.setItem('titles', JSON.stringify(comics));
    
    const message = "Your comics title is save complite!" + "\n\n" + comics.join('\n');
    alert(message);
}

function loadComics() {
    //localStorageから取り出し
    let comics = localStorage.getItem('titles');

    //取り出した後にJSON.parseをかけます。
    comics = JSON.parse(comics);

    return comics;
}

// saveComics();
