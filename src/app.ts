import axios from 'axios';

const form = document.querySelector("form")!; //null이 아니라는 것을 의미
const addressInput = document.getElementById("address")! as HTMLInputElement;
//addressInput.value를 사용하려면 이 요소가 input요소임을 타입스크립트가 알아야 하므로 타입캐스팅

const GOOGLE_API_KEY = 'AIzaSyDh57nz_bescw4I5G02XiVWPtvV3NU8bJo';

//declare var google: any;


//axios.get메서드에 자체 타입 알리어스(사용자 지정 타입) 만들기
type GoogleGeocodingResponse = {
    results: { geometry: { location: { lat: number; lng: number } } }[];
    status: 'OK' | "ZERO_RESULTS";
    //status는 구글이 성공했는지 여부를 알려주는 문자열, OK혹은 다른값 여러개가 있지만
    //여기서는 두개의 값중 하나로 상태코드를 받았음을 타입스크립트에게 전달한다.
}

function searchAddressHandler(event: Event){ //Event타입
    event.preventDefault(); //submit기본동작인 요청 전송과 새로고침을 막아준다.
    const enteredAddress = addressInput.value;//브라우저에서 input에 입력한 주소값

    //주소에 따른 좌표를 받기위한 axios.get요청
    //enteredAddress는 사용자가 입력한 텍스트 그대로로, 특수문자, 공백, 쉼표 등이 포함될 수 있다.
    //encodeURI()는 입력한 문자열을 URL에서 호환가능한 문자열로 변환시켜주는 내장함수

    //get메서드를 제네릭메서드로 만들어 타입스크립트에게 우리가 기대하는 response를 전달할 수 있다.
    //제네릭 메서드로 만든 후 res.data에 .을 입력하면 자동완성으로 코드가 보여진다.
    axios
    .get<GoogleGeocodingResponse>(
    `https://maps.googleapis.com/maps/api/geocode/json?address=
    ${encodeURI(enteredAddress)}&key=${GOOGLE_API_KEY}`)
    .then(res => { //get요청을 하고 난 후 받아온 결과값(위도,경도 좌표객체가 나와야 한다.)
        //console.log(res);

        //상태코드가 ok가 아닐 경우 에러 대응
        if(res.data.status !== "OK") throw new Error('Could not fetch location');
        const coordinates = res.data.results[0].geometry.location;
        console.log(coordinates);
        //res객체에는 data필드가 있고, 그 안에 results필드가 있고 results필드는 배열이다.
        //배열안의 요소들이 구글이 검색한 결과이고 일반적으로 첫번째 결과가 가장 좋다.
        //요소에 들어가면 양식화된 주소가 있는데, 우리가 입력한 것에 비해 좀 더 완성된 주소로 바뀌어 있다.
        //다음은 geometry키가 있다. 열면 위치가 보이고, 우리가 원하는 위도와 경도 좌표를 갖춘 객체가 있다.
        //res.data > results > geometry > location : {lat: 0, lng: 0} =위도&경도를 찾는 경로
        //우리는 이 위도와 경도를 지도 상에 렌더링 시켜야 한다.

        
        //지도의 2가지 필수옵션 center,zoom
        //공식문서에 있는 google.map.constructor 함수를 인스턴스화 해야 한다.
        //좌표를 얻으면 이 코드를 실행시킨다.
        const map = new google.maps.Map(document.getElementById('map')!, { //map이 없을수도 있다고 에러 났음
            center: coordinates, //위도와 경도의 객체
            zoom: 16 //확대레벨, 숫자가 높을수록 지도가 확대되어 렌더링된다.
          });
          //지도가 렌더링 될 때, 마커도 표시하고 싶다면 공식문서에서 마커로 맵추가하기 참고!
          new google.maps.Marker({position: coordinates, map: map});
    })
    .catch(err => {
        console.log(err); //get요청 실패시 err를 찍어준다.
        alert(err.message);//위의 코드 상태코드가 ok가 아닐경우에 에러메세지를 보여준다.
    });
}

form.addEventListener('submit', searchAddressHandler);



