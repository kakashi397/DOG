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
const labelForChome = document.querySelector('label[for="chome"]');
// gouラベルを取得する
const labelForGou = document.querySelector('label[for="gou"]');


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



/* ---------
イベントリスナー
---------- */
// 大字香椎が選択されたらchomeとgouのインプットとラベルを消す
// town-nameラジオ全てに対してchangeイベントリスナーを設置
townNameRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    // isOoazakashiiをtrue/falseに使う
    const isOoazakasahii = (getTownNameValue() === '大字香椎');
    // 各要素のクラスにisOoazakashiiのT/Fによってhiddenクラスをトグルする
    chome.classList.toggle('hidden', isOoazakasahii);
    labelForChome.classList.toggle('hidden', isOoazakasahii);
    gou.classList.toggle('hidden', isOoazakasahii);
    labelForGou.classList.toggle('hidden', isOoazakasahii);
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
  if (townNameValue === '大字香椎') {
    // 入力された値を成形する
    const timeZoneAddress = `${timeZoneValue}: 福岡県福岡市東区${townNameValue}${banchiValue}番地`;
    // 成形されたテキストを配達先リストの枠内に表示する
    addressList.insertAdjacentHTML('beforeend', /* html */`<li>${timeZoneAddress}</li>`);
  } else {
    // 入力された値を成形する
    const timeZoneAddress = `${timeZoneValue}: 福岡県福岡市東区${townNameValue}${chomeValue}丁目${banchiValue}-${gouValue}`;
    // 成形されたテキストを配達先リストの枠内に表示する
    addressList.insertAdjacentHTML('beforeend', /* html */`<li>${timeZoneAddress}</li>`);
  }
  // フォームの入力をリセットする
  form.reset();
});
