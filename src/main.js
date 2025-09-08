import 'normalize.css';
import './styles/main.scss';

/* ---------
取得
---------- */
// 「配達先を追加」ボタンを取得
const addButton = document.querySelector('#add-address');
// 配達先リストの枠を取得
const addressList = document.querySelector('#address-list');
// form全体を取得(id名から取得)
const form = document.forms['form'];
// time-zoneラジオボタンを取得する
const timeZoneRadios = form.elements['time-zone'];
// town-nameラジオボタンを取得する
const townNameRadios = form.elements['town-name'];
// chomeインプットを取得する
const chome = form.elements['chome'];
// banchiインプットを取得する
const banchi = form.elements['banchi'];
// gouインプットを取得する
const gou = form.elements['gou'];
// chomeラベルを取得する
const labelForChome = document.querySelector('label[for = chome]');
// gouラベルを取得する
const labelFotGou = document.querySelector('label[for = gou]');

/* ----------
関数定義
---------- */
// 選ばれたtime-zoneを取得する関数定義
const getTimeZoneValue = () => {
  return timeZoneRadios.value;
};
// 選ばれたtown-nameを取得する関数定義
const getTownNameValue = () => {
  return townNameRadios.value;
};
// chomeの値を取得する関数定義
const getChomeValue = () => {
  return chome.value;
};
// banchiの値を取得する関数定義
const getBanchiValue = () => {
  return banchi.value;
};
// gouの値を取得する関数定義
const getGouValue = () => {
  return gou.value;
};
// 大字香椎の選択によるchome, gouをトグルする関数定義


/* ---------
イベントリスナー
---------- */
// 大字香椎が選択されたらchomeとgouを消す
townNameRadios.forEach((v) => {
  v.addEventListener('change', () => {
    const townNameValue = getTownNameValue();
    if (townNameValue === '大字香椎') {

    }
  });
});

// 「配達先を追加」ボタンにクリックイベントリスナーをセット
addButton.addEventListener('click', (e) => {
  e.preventDefault();
  // 各ラジオボタン、入力欄の値を取得
  const timeZoneValue = getTimeZoneValue();
  const townNameValue = getTownNameValue();
  const chomeValue = getChomeValue();
  const banchiValue = getBanchiValue();
  const gouValue = getGouValue();
  // 入力された値を成形する
  const timeZoneAddress = `${timeZoneValue}: 福岡県福岡市東区${townNameValue}${chomeValue}丁目${banchiValue}-${gouValue}`;
  console.log(timeZoneAddress);
  // 成形されたテキストを配達先リストの枠内に表示する
  addressList.insertAdjacentHTML('beforeend', /* html */`<li>${timeZoneAddress}</li>`);
  // フォームの入力をリセットする
  form.reset();
});

