// function hasUserMedia(){
//     return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
//         || navigator.msGetUserMedia);

// }
// if(hasUserMedia()){
//     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
//     || navigator.msGetUserMedia;
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }, function(stream){
//         let video = document.getElementById('video');
//         video.srcObject = stream;
//         video.onloadedmetadata = function(e){
//             video.play();
//         }
//     }, function(err){});
// }else{
//     alert('Sorry, your browser does not support getUserMedia.')
// }

//---------------STEP 2 (creating options for multiple devices)

// MediaStreamTrack.getSources(function(sources){
// 	let audioSource = null;
// 	let videoSource = null;
// 	for (let i = 0; i < sources.length;++i){
// 		let source = sources[i]
//         if(source.kind === "audio"){
//           console.log("mic found:",source.label, source.id);
//           audioSource = source.id;
//         }else if(source.kind === "video"){
//           console.log("Camera found:", source.label, source.id);
//           videoSource = source.id;
//         }else{
//           console.log("unknown source found:", source)
//         }
//     }
//   let constraints = {
//     audio: {
//       optional: [{ sourceId: audioSource }]
//     },
//     video: {
//       optional: [{ sourceId: videoSource }]
//     }
//   };
// navigator.getUserMedia(constraints, function(stream){
// 	let video = document.querySelector('video');
// 	video.src = window.URL.createObjectURL(stream);
// },function(error){
// console.log('raised error when capturing:', error)
// })
// })

// ----------- STEP 3 (RTCPeerCommunication object)

function hasUserMedia(){
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
        || navigator.msGetUserMedia);

}

function hasRTCPeerConnection(){
  window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection 
  || window.mozRTCPeerConnection;
  return !!window.RTCPeerConnection;
}

let yourVideo = document.getElementById('yours'),
    theirVideo = document.getElementById('theirs'),
    yourConnection, theirConnection;

if(hasUserMedia()){
  navigator.getUserMedia = navigator.getUserMedia({ video: true, audio: false },
  function(stream){
    yourVideo.srcObject = stream;

    if(hasRTCPeerConnection()){
      startPeerConncection(stream);
    }else{
      alert('Sorry, your browser does not support WebRTC');
    }
  },function(error){
    alert('Sorry, we failed to capture your camera, please try again')
  })
} else {
  alert('Sorry, your browser does not support WebRTC');
}

function startPeerConncection(stream){
  // custom ICE server
  let configuration = {
    "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
  };
  yourConnection = new RTCPeerConnection(configuration);
  theirConnection = new RTCPeerConnection(configuration);

  // Setup stream listening
  yourConnection.addStream(stream);
  theirConnection.onaddstream = function(e){
    theirVideo.srcObject = e.stream;
    console.log(theirVideo.srcObject, e.stream)
  };

  // Setup ice handling
  yourConnection.onicecandidate = function(event){
    if(event.candidate){
      theirConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };

  theirConnection.onicecandidate = function(event){
    if(event.candidate){
      console.log('event.candidate', event.candidate)
      yourConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };

  // Begin the offer
  yourConnection.createOffer(function(offer){
    yourConnection.setLocalDescription(offer);
    theirConnection.setRemoteDescription(offer);

    theirConnection.createAnswer(function(offer){
      theirConnection.setLocalDescription(offer);
      yourConnectioin.setRemoteDescription(offer);
    });
  });

  
};

