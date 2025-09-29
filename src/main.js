import 'normalize.css';
import './styles/main.scss';

/* ---------
定数・変数宣言
---------- */
// 郵便局の座標を定数に代入しておく
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
// GoogleMapsAPIキーを.envから取得する
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// form全体を取得(id名から取得)する
const form = document.forms['form'];
// time-slotラジオボタンを取得する
const timeSlotRadios = form.elements['time-slot'];
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
// 「配達先を追加」ボタンを取得する
const addButton = document.querySelector('#add-address');
// 「配達先を削除」ボタンを取得する
const removeButton = document.querySelector('#remove-address');
// 「配達順生成」ボタンを取得する
const generateOrderButton = document.querySelector('#generate-order');
// 配達先リストの枠を取得する
const addressList = document.querySelector('#address-lists');



/* ----------
関数定義
---------- */
// 選ばれたtime-slotを取得して返す関数定義
const getTimeSlotValue = () => {
  return timeSlotRadios.value;
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
const getMissingFields = (timeSlot, townName, chome, banchi, gou) => {
  const undefinedInputs = [];
  if (!timeSlot) {
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
const formatAddress = (timeSlot, townName, chome, banchi, gou) => {
  if (townName === '大字香椎') {
    return `${timeSlot}: 福岡県福岡市東区${townName}${banchi}番地`
  } else {
    return `${timeSlot}: 福岡県福岡市東区${townName}${chome}丁目${banchi}-${gou}`
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
// 配達先リストにある配達先を全て取得する関数定義
const getAddedAddress = () => {
  return addressList.children;
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
// 配達先リスト内の配達先を時間帯ごとに振り分け、配列にしたオブジェクトで返す関数定義
const groupByTimeSlot = () => {
  const timeSlots = { '18-20': [], '19-21': [] };
  // オブジェクトが持つキーを値として持つ配列を作れるメソッド
  const labels = Object.keys(timeSlots);
  const addedAddress = Array.from(getAddedAddress());

  // forEachが二重構造になっているので注意
  addedAddress.forEach((v) => { //これはli要素ごと
    labels.forEach((label) => { // これは時間帯ごと
      if (v.textContent.includes(label)) {
        timeSlots[label].push(v.textContent.slice(7));
      }
    });
  });
  return timeSlots;
};
// timeSlotsの値（配達先住所）を一件ずつGeocodingAPIへ送り変換された座標を再び時間帯ごとに配列にまとめたオブジェクトを返す関数定義
const sendToGeocodingApi = async (timeSlots) => {
  const result = {};

  for (const [slot, addresses] of Object.entries(timeSlots)) {
    const destinations = [];

    for (const addressText of addresses) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${apiKey}`
        );
        const data = await res.json();

        destinations.push({
          waypoint: {
            location: {
              latLng: {
                latitude: data.results[0].geometry.location.lat,
                longitude: data.results[0].geometry.location.lng,
              },
            },
          },
        });
      } catch (err) {
        console.error(slot, addressText, err);
      }
    }
    result[slot] = destinations;
  }
  return result;
};
/* 9月18日　このコードはsendsendToGeocodingApi()の債務の分離を意識したもの　後々可能ならば続きを完成させるが、一旦プロジェクト全体を先に進めることにする。

const sendToGeocodingApi = async (timeSlots) => {
  const result = [];
  for (const addresses of Object.values(timeSlots) ) {
    for (const addressText of addresses) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${apiKey}`
        );
        const data = await res.json();
        result.push(data);
      } catch (err) {
        console.error(addressText, err);
      }
    }
  }
  console.log(result);
  
  return result;
}; */

// 郵便局の座標も追加して18-20時のslotを作る関数定義
const createSlot1820 = (result) => {
  return [postOfficeLatLng, ...Array.from(result['18-20'])];
};
// 18-20時最後の配達先の座標、最後に郵便局の座標も追加して19-21時のslotを作る関数定義
const createSlot1921 = (result, bestOrder) => {
  return [result['18-20'].at(bestOrder.at(-1) - 1), ...Array.from(result['19-21']), postOfficeLatLng];
};
// ペイロードを作る関数定義
const createPayload = (slot) => {
  const body = {
    origins: slot,
    destinations: slot,
  };
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'originIndex,destinationIndex,status,distanceMeters,duration',
    },
    body: JSON.stringify(body), // ここでbodyオブジェクトをJSONに変換してる
  };
  return payload;
};
// ペイロードをCompute Route Matrix APIに送り、各配達先間の時間と距離を得る関数定義
const sendToComputeRouteMatrixApi = async (payload) => {
  const res = await fetch(
    'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', payload
  );
  const data = await res.json();
  return data;
};
// RouteMatrixAPIのレスポンスから必要な情報のみを抽出したMapオブジェクトを作る関数定義
const createRouteMatrixMap = (data) => {
  const routeMatrixMap = new Map(); // Mapオブジェクトを採用
  for (const row of data) {
    if (routeMatrixMap.has(row.originIndex)) {
      // originIndexのキーを既に持ってたら、その値にオブジェクト型でデータを渡す
      routeMatrixMap.get(row.originIndex).push({ destinationIndex: row.destinationIndex, duration: row.duration, distanceMeters: row.originIndex === row.distinationIndex ? 0 : row.distanceMeters });
    } else { // キーが無ければ作ってから、その値にオブジェクト型でデータを渡す
      routeMatrixMap.set(row.originIndex, []);
      routeMatrixMap.get(row.originIndex).push({ destinationIndex: row.destinationIndex, duration: row.duration, distanceMeters: row.originIndex === row.distinationIndex ? 0 : row.distanceMeters });
    }
  }
  return routeMatrixMap;
};
// 総移動時間を計算する関数定義
/* const calculateTotalDuration = (order, routeMatrixMap) => {
  // 総移動時間の初期化
  let totalDuration = 0;
  // 現在地は郵便局(0)からスタート
  let currentOrigin = 0;
  for (const next of order) {
    // 次の配達先の一覧をdestinationsFromCurrentに代入
    const destinationsFromCurrent = routeMatrixMap.get(currentOrigin);
    // 現在のnextの番号と同じdestinationIndexを見つけてdに代入
    const destination = destinationsFromCurrent.find(d => d.destinationIndex === next);
    // 次の配達先へのdurationを足す
    totalDuration += Number(destination.duration.replace('s', ''));
    // 現在地の更新
    currentOrigin = next;
  }
  return totalDuration;
}; */
// 総移動距離を計算する関数定義
const calculateTotalDistance = (order, routeMatrixMap) => {
  // 総移動距離の初期化
  let totalDistance = 0;
  // 現在地は郵便局(0)からスタート
  let currentOrigin = 0;
  for (const next of order) {
    // 次の配達先の一覧をdestinationsFromCurrentに代入
    const destinationsFromCurrent = routeMatrixMap.get(currentOrigin);
    // 現在のnextの番号と同じdestinationIndexを見つけてdに代入
    const destination = destinationsFromCurrent.find(d => d.destinationIndex === next);
    // 次の配達先へのdistanceMetersを足す
    totalDistance += destination.distanceMeters;
    // 現在地の更新
    currentOrigin = next;
  }
  return totalDistance;
};
// Greedy(移動時間)アルゴリズムの関数定義
/* const durationGreedyAlgorithm = (routeMatrixMap) => {
  // 訪問済みのdestinationを格納するSetを用意しておく
  const visited = new Set();
  // 現在のoriginを格納する変数を用意しておく（最初は0つまり郵便局をセット済み）
  let currentOrigin = 0;
  // RouteMatrixMapのsizeを取得する
  const totalDestinations = routeMatrixMap.size;
  // 生成された配達順番を保持する配列
  const initialOrder = [];
  // すべての配達先が順番に並ぶまでwhileループ
  while (visited.size < totalDestinations) {
    // 現在地routeMatrixMap.get(currentOrigin)が持つ配達先たち
    const destinationsFromCurrent = routeMatrixMap.get(currentOrigin);
    // 最小のdurationを入れる変数を用意しておく
    let minDuration = Infinity;
    // 次の配達先を入れる変数を用意しておく
    let nextDestination = null;
    // 各destinationのdurationを比較していく
    for (const destination of destinationsFromCurrent) {
      // RouteMatrixMapのdurationは'~~s'という文字列なのでsを''（空白でもない、無）に置き換え（要するにsを削除）してNumber型に変換する
      const durationSec = Number(destination.duration.replace('s', ''));
      // durationSecが0（自分自身が目的地）になったとき、もしくは、visitedSetにdestinationIndexが存在していたとき、もしくはdestinationIndex === 0つまり郵便局が一番近い配達先に選ばれているとき、現在のループを抜け出す
      if (durationSec === 0 || visited.has(destination.destinationIndex) || destination.destinationIndex === 0) continue;
      // durationSecの比較と更新、nextDestinationの更新
      if (durationSec < minDuration) {
        minDuration = durationSec;
        nextDestination = destination;
      }
    }
    // もういける場所がなくなったらwhile終了
    if (!nextDestination) break;
    // visitedに次の配達先のdestinationIndexを追加しておく
    visited.add(nextDestination.destinationIndex);
    // 次の出発地の更新
    currentOrigin = nextDestination.destinationIndex;
    // orderの更新
    initialOrder.push(nextDestination.destinationIndex);
  }
  return initialOrder;
}; */
// Greedy(移動距離)アルゴリズムの関数定義
const distanceGreedyAlgorithm = (routeMatrixMap) => {
  // 訪問済みのdestinationを格納するSetを用意しておく
  const visited = new Set();
  // 現在のoriginを格納する変数を用意しておく（最初は0をセット済み）
  let currentOrigin = 0;
  // RouteMatrixMapのsizeを取得する
  const totalDestinations = routeMatrixMap.size;
  // 生成された配達順番を保持する配列
  const initialOrder = [];
  // すべての配達先が順番に並ぶまでwhileループ
  while (visited.size < totalDestinations) {
    // 現在地routeMatrixMap.get(currentOrigin)が持つ配達先たち
    const destinationsFromCurrent = routeMatrixMap.get(currentOrigin);
    // 最小のdistanceを入れる変数を用意しておく
    let minDistance = Infinity;
    // 次の配達先を入れる変数を用意しておく
    let nextDestination = null;
    // 各destinationのdistanceMetersを比較していく
    for (const destination of destinationsFromCurrent) {
      const distanceMeters = destination.distanceMeters;
      // distanceMetersが0（自分自身が目的地）になったとき、もしくは、visitedSetにdestinationIndexが存在していたとき、もしくはdestinationIndex === 0が一番近い配達先に選ばれているとき、現在のループを抜け出す
      if (distanceMeters === 0 || visited.has(destination.destinationIndex) || destination.destinationIndex === 0 || destination.destinationIndex === 12) continue;
      // distanceMetersの比較と更新、nextDestinationの更新
      if (distanceMeters < minDistance) {
        minDistance = distanceMeters;
        nextDestination = destination;
      }
    }
    // もういける場所がなくなったらwhile終了
    if (!nextDestination) break;
    // visitedに次の配達先のdestinationIndexを追加しておく
    visited.add(nextDestination.destinationIndex);
    // 次の出発地の更新
    currentOrigin = nextDestination.destinationIndex;
    // orderの更新
    initialOrder.push(nextDestination.destinationIndex);
  }
  return initialOrder;
};
// 2-optアルゴリズム(時間)の関数定義
/* const durationTwoOptAlgorithm = (initialOrder, routeMatrixMap) => {
  // whileループを走らせるスイッチ
  let improved = true;
  // 勝ち残りの配達順(初期はinitialOrderをコピーして使う)
  let bestOrder = [...initialOrder];
  // 勝ち残りのduration
  let bestDuration = calculateTotalDuration(bestOrder, routeMatrixMap);

  while (improved) {
    // 改善が見つからなかった状態を最初にセット
    improved = false;
    for (let i = 0; i < bestOrder.length - 1; i++) { // 反転の始点(i)をforループ
      for (let k = i + 1; k < bestOrder.length; k++) { // 反転の終点(k)をforループ
        // ルートを2-optで反転
        const newOrder = [
          ...bestOrder.slice(0, i), // 反転させない前半
          ...bestOrder.slice(i, k + 1).reverse(), // iとkを含んで反転
          ...bestOrder.slice(k + 1) // 反転させない後半
        ];
        // durationを比較する部分　短くなるならそのdurationを保持してimproved = trueにスイッチ
        const newDuration = calculateTotalDuration(newOrder, routeMatrixMap);
        if (newDuration < bestDuration) {
          bestOrder = newOrder;
          bestDuration = newDuration;
          improved = true;
        }
      }
    }
  }
  return bestOrder;
}; */
// 2-optアルゴリズム（距離）の関数定義
const distanceTwoOptAlgorithm = (initialOrder, routeMatrixMap) => {
  // whileループを走らせるスイッチ
  let improved = true;
  // 勝ち残りの配達順(初期はinitialOrderをコピーして使う)
  let bestOrder = [...initialOrder];
  // 勝ち残りのdistance
  let bestDistance = calculateTotalDistance(bestOrder, routeMatrixMap);

  while (improved) {
    // 改善が見つからなかった状態を最初にセット
    improved = false;
    for (let i = 0; i < bestOrder.length - 1; i++) { // 反転の始点(i)をforループ
      for (let k = i + 1; k < bestOrder.length; k++) { // 反転の終点(k)をforループ
        // ルートを2-optで反転
        const newOrder = [
          ...bestOrder.slice(0, i), // 反転させない前半
          ...bestOrder.slice(i, k + 1).reverse(), // iとkを含んで反転
          ...bestOrder.slice(k + 1) // 反転させない後半
        ];
        // distanceを比較する部分　短くなるならそのdistanceを保持してimproved = trueにスイッチ
        const newDistance = calculateTotalDistance(newOrder, routeMatrixMap);
        if (newDistance < bestDistance) {
          bestOrder = newOrder;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }
  return bestOrder;
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
  const timeSlotValue = getTimeSlotValue();
  const townNameValue = getTownNameValue();
  const chomeValue = getChomeValue();
  const banchiValue = getBanchiValue();
  const gouValue = getGouValue();
  // 項目の未入力がないかを調べる
  const missingFields = getMissingFields(timeSlotValue, townNameValue, chomeValue, banchiValue, gouValue);
  // 未入力項目をフィードバックする
  if (missingFields.length) {
    showFeedbackMessage(missingFields);
  } else { // 全部入力済みなら
    // 値に応じてテキストを成形する
    const formattedTimeSlotAddress = formatAddress(timeSlotValue, townNameValue, chomeValue, banchiValue, gouValue);
    // 成形されたテキストを配達先リストに送る
    addFormattedAddress(formattedTimeSlotAddress);
    // フィードバックが残っていれば削除する
    removeFeedbackMessage();
    // フォームの入力をリセットする
    form.reset();
  }
});
// 「配達先を削除」ボタンを押すと選択された配達先を削除する
removeButton.addEventListener('click', (e) => {
  e.preventDefault();
  const checkedboxes = getCheckedboxes();
  removeCheckedboxes(checkedboxes);
});
// 「配達順生成」ボタンへのイベントリスナー
generateOrderButton.addEventListener('click', async (e) => {
  e.preventDefault();
  // GeocodingAPIに関する処理
  const timeSlots = groupByTimeSlot();
  const result = await sendToGeocodingApi(timeSlots);

  // RouteMatrixAPIに向けてデータを成形していく(18-20時)
  const slot1820 = createSlot1820(result);
  const payload1820 = createPayload(slot1820);
  // RouteMatrixAPIを叩く
  const data1820 = await sendToComputeRouteMatrixApi(payload1820);
  // RouteMatrixAPIで得られたdataをアルゴリズムに使うMapオブジェクトに変換する
  const routeMatrixMap1820 = createRouteMatrixMap(data1820);
  // まずはGreedyAlgorithmで元のルートを生成、これを2-optで改善していく(距離)
  const distanceInitialOrder1820 = distanceGreedyAlgorithm(routeMatrixMap1820);
  const bestOrder1820 = distanceTwoOptAlgorithm(distanceInitialOrder1820, routeMatrixMap1820);
  // 以下19-21時の処理
  const slot1921 = createSlot1921(result, bestOrder1820);
  const payload1921 = createPayload(slot1921);
  const data1921 = await sendToComputeRouteMatrixApi(payload1921);
  const routeMatrixMap1921 = createRouteMatrixMap(data1921);
  const distanceGreedyAlgorithm1921 = distanceGreedyAlgorithm(routeMatrixMap1921);
  const bestOrder1921 = distanceTwoOptAlgorithm(distanceGreedyAlgorithm1921, routeMatrixMap1921);
  console.log(bestOrder1921);
});