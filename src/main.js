import 'normalize.css';
import './styles/main.scss';

/* ---------
取得
---------- */
// 「配達先を追加」ボタンを取得
const addButton = document.querySelector('#add-address');
// 「配達先を削除」ボタンを取得
const removeButton = document.querySelector('#remove-address');
// 配達先リストの枠を取得
const addressList = document.querySelector('#address-lists');
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
// 項目の未入力がないかを調べ、配列にする関数定義
const getMissingFields = (timeZone, townName, chome, banchi, gou) => {
  const undefinedInputs = [];
  if (!timeZone) {
    undefinedInputs.push('時間帯');
  }
  if (!townName) {
    undefinedInputs.push('町名');
  }
  if (!banchi) {
    undefinedInputs.push('番地');
  }
  if (townName !== '大字香椎') {
    if (!chome) {
      undefinedInputs.push('丁目');
    }
    if (!gou) {
      undefinedInputs.push('号');
    }
  }
  const correctOrder = ['時間帯', '町名', '丁目', '番地', '号'];
  undefinedInputs.sort((a, b) => {
    return correctOrder.indexOf(a) - correctOrder.indexOf(b);
  });
  return undefinedInputs;
}
// フィードバックメッセージ用の要素を作る関数定義
const createFeedbackElement = (text) => {
  const feedbackMessage = document.createElement('p');
  feedbackMessage.textContent = text;
  feedbackMessage.setAttribute('id', 'feedback-message');
  feedbackMessage.classList.add('feedback');
  return feedbackMessage;
};
// 未入力項目をフィードバックする関数定義
const showFeedbackMessage = (arr) => {
  if (arr.length > 0) {
    removeFeedbackMessage();
    const feedbackElement = createFeedbackElement(`${arr}を入力してください`);
    addButton.insertAdjacentElement('afterend', feedbackElement);
  }
};
// フィードバックメッセージがあれば削除する関数定義
const removeFeedbackMessage = () => {
  if (document.querySelector('#feedback-message')) {
    document.querySelector('#feedback-message').remove();
  }
};
// 入力された値に応じて時間帯と住所のテキストを成形する関数定義
const formatAddress = (timeZone, townName, chome, banchi, gou) => {
  if (townName === '大字香椎') {
    return `${timeZone}: 福岡県福岡市東区${townName}${banchi}番地`
  } else {
    return `${timeZone}: 福岡県福岡市東区${townName}${chome}丁目${banchi}-${gou}`
  }
};
// 成形されたテキストを配達先リストの枠内に表示する関数定義
const addFormattedAddress = (txt) => {
  // li要素づくり
  const li = document.createElement('li');
  // input[type='checkbox']要素づくり
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'added-address';
  checkbox.classList.add('checkbox');

  // li>inputの構造にする
  li.appendChild(checkbox);
  // liのテキストをtxtのものにする
  li.appendChild(document.createTextNode(txt));

  // ol>liの構造にする
  addressList.appendChild(li);
};
// チェックされたチェックボックスを取得する関数定義
const getCheckedBox = () => {

};



/* ---------
イベントリスナー
---------- */
// 大字香椎が選択されたらchomeとgouのインプットとラベルを消す
// town-nameラジオ全てに対してchangeイベントリスナーを設置
townNameRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    // isOoazakashiiをtrue/falseに使う
    const isOoazakashii = (getTownNameValue() === '大字香椎');
    // 各要素のクラスにisOoazakashiiのT/Fによってhiddenクラスをトグルする
    chome.classList.toggle('hidden', isOoazakashii);
    labelForChome.classList.toggle('hidden', isOoazakashii);
    gou.classList.toggle('hidden', isOoazakashii);
    labelForGou.classList.toggle('hidden', isOoazakashii);
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
  // 項目の未入力がないかを調べる
  const missingFields = getMissingFields(timeZoneValue, townNameValue, chomeValue, banchiValue, gouValue);
  // 未入力項目をフィードバックする
  if (missingFields.length) {
    showFeedbackMessage(missingFields);
  } else { // 全部入力済みなら
    // 値に応じてテキストを成形する
    const formattedTimeZoneAddress = formatAddress(timeZoneValue, townNameValue, chomeValue, banchiValue, gouValue);
    // 成形されたテキストを配達先リストに送る
    addFormattedAddress(formattedTimeZoneAddress);
    // フィードバックが残っていれば削除する
    removeFeedbackMessage();
    // フォームの入力をリセットする
    form.reset();
  }
});
