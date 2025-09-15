import 'normalize.css';
import './styles/main.scss';

/* ---------
変数宣言
---------- */
const postOfficeLatLng = {
  'waypoint': {
    'location': {
      'latLng': {
        'latitude': 33.65341086805036,
        'longitude': 130.43435231268512,
      }
    }
  }
};

/* ---------
取得
---------- */
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
// 「配達先を追加」ボタンを取得
const addButton = document.querySelector('#add-address');
// 「配達先を削除」ボタンを取得
const removeButton = document.querySelector('#remove-address');
// 配達先リストの枠を取得
const addressList = document.querySelector('#address-lists');
// 「ルート生成」ボタンを取得
const generateRouteButton = document.querySelector('#generate-route');
// GoogleMapsAPIキーを.envから取得する
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ----------
関数定義
---------- */
// 選ばれたtime-zoneを取得して返す関数定義
const getTimeZoneValue = () => {
  return timeZoneRadios.value;
};
// 選ばれたtown-nameを取得して返す関数定義
const getTownNameValue = () => {
  return townNameRadios.value;
};
// chomeの値を取得して返す関数定義
const getChomeValue = () => {
  return chome.value;
};
// banchiの値を取得して返す関数定義
const getBanchiValue = () => {
  return banchi.value;
};
// gouの値を取得して返す関数定義
const getGouValue = () => {
  return gou.value;
};
// 項目の未入力がないかを調べ、配列にして返す関数定義
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
// フィードバックメッセージ用の要素を作って返す関数定義
const createFeedbackElement = (text) => {
  const feedbackMessage = document.createElement('p');
  feedbackMessage.textContent = text;
  feedbackMessage.setAttribute('id', 'feedback-message');
  feedbackMessage.classList.add('feedback');
  return feedbackMessage;
};
// フィードバックメッセージを表示する関数定義
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
  // liのテキストをtxtのものにする .textContentだと子要素を全部消してtxtのみに置き換わる  今回はinputを残したいので.createTextNodeを使用する
  li.appendChild(document.createTextNode(txt));

  // ol>liの構造にする
  addressList.appendChild(li);
};
// チェックされた配達先を取得する関数定義
const getCheckedboxes = () => {
  return Array.from(getAddedAddress()).filter(li => {
    const checkbox = li.querySelector('input[type="checkbox"]');
    return checkbox && checkbox.checked
  });
};
// チェックされた配達先を削除する関数定義
const removeCheckedboxes = (arr) => {
  arr.forEach((li) => {
    li.remove();
  });
};
// 配達先リストにある配達先を全て取得する関数定義
const getAddedAddress = () => {
  return addressList.children;
};
// 配達先リストにある配達先から住所部分のみを切りだし配列を作る関数定義
const getAddressTexts = () => {
  return Array.from(getAddedAddress()).map(v => v.textContent.slice(7))
};
// addressTextの配列を一件ずつGeocodingAPIへ送りRouteMatrixAPIが求めるJSON形式で返す関数定義
const sendToGeocodingApi = async (addressTexts) => {
  const destinations = [];
  for (const addressText of addressTexts) {
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${apiKey}`);
      const data = await res.json();
      destinations.push({
        'waypoint': {
          'location': {
            'latLng': {
              'latitude': data.results[0].geometry.location.lat,
              'longitude': data.results[0].geometry.location.lng
            }
          }
        }
      });
    } catch (err) {
      console.error(addressTexts, err);
    }
  }
  return destinations;
};
// destinationsの先頭にpostOfficeLatLngを挿入する関数定義
const createOrigins = (destinations) => {
  const origins = [postOfficeLatLng, ...destinations];
  return origins;
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
// 「配達先を追加」ボタンをクリックすると配達先リストに配達先を追加する
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
// 「配達先を削除」ボタンを押すと選択された配達先を削除する
removeButton.addEventListener('click', (e) => {
  e.preventDefault;
  const checkedboxes = getCheckedboxes();
  removeCheckedboxes(checkedboxes);
});
// 「ルート生成」ボタンへのイベントリスナー
generateRouteButton.addEventListener('click', async (e) => {
  e.preventDefault();
  // GeocodingAPIに関するコード
  const adressTexts = getAddressTexts();
  const destinations = await sendToGeocodingApi(adressTexts);
  const origins = createOrigins(destinations);
  console.log({origins, destinations});
  return {origins, destinations};
});



/* ペイロードは時間帯別に作る必要がある（現在は全部一緒くたになってる）
19～21時のペイロードは1820の最後の配達先が必要になる */



// // ペイロード
// {
//   "origins": [
//     {
      
//     }
//   ],
//   "destinations": [
//     {
      
//     }
//   ],
// }