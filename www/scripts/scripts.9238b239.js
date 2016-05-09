!function(){"use strict";angular.module("firebase.auth",["firebase","firebase.ref"]).factory("Auth",["$firebaseAuth","FireRef",function(a,b){return a(b)}])}(),angular.module("firebase.config",[]).constant("FBURL","https://luminous-torch-8131.firebaseio.com").constant("SIMPLE_LOGIN_PROVIDERS",["password"]).constant("loginRedirectPath","/login"),angular.module("firebase.ref",["firebase","firebase.config"]).factory("FireRef",["$window","FBURL",function(a,b){"use strict";return new a.Firebase(b)}]).factory("RoomMetaRef",["FireRef",function(a){"use strict";return a.child("room-metadata")}]).factory("RoomMsgsRef",["FireRef",function(a){"use strict";return a.child("room-messages")}]).factory("ModeratorsRef",["FireRef",function(a){"use strict";return a.child("moderators")}]).factory("SuspensionsRef",["FireRef",function(a){"use strict";return a.child("suspensions")}]).factory("OnlineUsersRef",["FireRef",function(a){"use strict";return a.child("user-names-online")}]).factory("RoomUsersRef",["FireRef",function(a){"use strict";return a.child("room-users")}]).factory("UsersRef",["FireRef",function(a){"use strict";return a.child("users")}]);var platform=new H.service.Platform({app_id:"CANoBLV3MxOwshOlsIQ5",app_code:"uZpR7tyRZWvkiI4OWj3G2Q"});angular.module("onTimeApp",["firebase","firebase.ref","firebase.auth","onsen","ngAnimate","ngAria","ngCookies","ngMessages","ngResource","ngRoute","ngSanitize","ngTouch","ngCordova","checklist-model"]).run(["Account",function(a){}]),angular.module("onTimeApp").config(["$routeProvider","SECURED_ROUTES",function(a,b){a.whenAuthenticated=function(c,d){return console.log(c),d.resolve=d.resolve||{},d.resolve.user=["Auth",function(a){return a.$requireAuth()}],a.when(c,d),b[c]=!0,a},a.otherwiseWarn=function(b){console.log(a),this.otherwise(b)},window.alert=function(a){ons.notification.alert({message:a})}}]).config(["$routeProvider",function(a){a.when("/login",{templateUrl:"views/login.html",controller:"LoginCtrl"}).whenAuthenticated("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).whenAuthenticated("/event/:roomId",{templateUrl:"views/event.html",controller:"EventCtrl"}).whenAuthenticated("/account",{templateUrl:"views/account.html",controller:"AccountCtrl"}).otherwiseWarn({redirectTo:"/"})}]).run(["$rootScope","$location","Auth","SECURED_ROUTES","loginRedirectPath",function(a,b,c,d,e){function f(a){!a&&g(b.path())&&b.path(e)}function g(a){return d.hasOwnProperty(a)}c.$onAuth(f),a.$on("$routeChangeError",function(a,c,d,f){"AUTH_REQUIRED"===f&&b.path(e)})}]).constant("SECURED_ROUTES",{}),angular.module("onTimeApp").factory("Account",["FireRef","UsersRef","$firebaseObject","Auth","$cordovaGeolocation",function(a,b,c,d,e){"use strict";function f(e){console.debug(d.$getAuth()),console.log("Logged in as:",e.uid),g.fbo=c(b.child(e.uid)),console.debug(g);var f=g.$ref().child("connections"),h=g.$ref().child("lastOnline"),i=a.child(".info/connected");i.on("value",function(a){if(a.val()===!0){var b=f.push(!0);b.onDisconnect().remove(),h.onDisconnect().set(Firebase.ServerValue.TIMESTAMP)}}),g.startLocationWatching()}var g={location:{lat:0,lng:0,accuracy:0,speed:0}};g.$ref=function(){return g.fbo.$ref()},g.getUsername=function(){return g.fbo.username},g.getId=function(){return g.fbo.$id},g.startLocationWatching=function(){var a={timeout:3e3,enableHighAccuracy:!1};e.watchPosition(a).then(null,function(a){alert(a)},function(a){g.location.timestamp=a.timestamp,g.location.lat=a.coords.latitude,g.location.lng=a.coords.longitude,g.location.accuracy=a.coords.accuracy,g.location.speed=a.coords.speed,g.$ref().child("location").set(g.location),console.debug("location watcher >> ",a," || account.location=",g.location)})};var h=d.$getAuth();return h?f(h):(console.log("Logged out"),d.$onAuth(function(a){f(a)})),g}]),angular.module("onTimeApp").factory("Friends",["UsersRef","Account","RoomMetaRef","RoomMsgsRef","RoomUsersRef","$firebaseArray","$firebaseObject",function(a,b,c,d,e,f,g){"use strict";var h={};return console.log("loaded account"),h.list=g(b.fbo.$ref().child("friends")),h.requests=g(b.fbo.$ref().child("requests")),h.searchUsername=function(b){return f(a.orderByChild("username").startAt(b).endAt(b+"z"))},h.sendFriendRequest=function(c,d){a.child(c).child("requests/received").child(b.getId()).set(b.getUsername(),function(a){return a?void window.alert("Ops! :S Unable to send the request."):void h.requests.$ref().child("sent").child(c).set(d,function(a){return a?void window.alert(a):void window.alert("request sent")})})},h.acceptFriendRequest=function(c,d){var e=d;h.list[c]=e,h.list.$save(),a.child(c).child("friends").child(b.getId()).set(b.getUsername()),h.ignoreFriendRequest(c)},h.ignoreFriendRequest=function(c,d){h.requests.received[c]=null,h.requests.$save(),a.child(c).child("requests").child("sent").child(b.getId()).remove()},h.cancelFriendRequest=function(c,d){h.requests.sent[c]=null,h.requests.$save(),a.child(c).child("requests").child("received").child(b.getId()).remove()},h}]),angular.module("onTimeApp").factory("Events",["$location","Firebase","FireRef","$firebaseArray","$firebaseObject","RoomMetaRef","RoomMsgsRef","UsersRef","Account","Friends",function(a,b,c,d,e,f,g,h,i,j){"use strict";function k(a){f.child(a.roomId).child("members").child(i.getId()).set({role:a.userRole||"mooch",username:i.getUsername()},function(c){c&&(console.error(c),window.alert("Error removing the invite")),i.$ref().child("rooms/"+a.roomId).set(b.ServerValue.TIMESTAMP,function(b){b&&(console.error(b),window.alert("Error removing the invite")),i.$ref().child("invites/"+a.$id).remove(function(a){a&&(console.error(a),window.alert("Error removing the invite from user"))})})})}function l(a){console.debug("removing the invite from user",a),f.child(a.roomId+"/members/"+a.toUserId).remove(function(b){b?(console.error(b),window.alert("Error removing the invite from room")):(console.debug("removing the invite from user",a),i.$ref().child("invites/"+a.$id).remove(function(a){a&&(console.error(a),window.alert("Error removing the invite from user"))}))})}function m(a){for(var b=0;b<o.list.length;b++)if(o.list[b].meta.$id===a)return b;return-1}function n(a){return o.list[m(a)]}var o={};return o.list=[],o.join=function(a){if(-1!==m(a)||!a||"undefined"===a)return console.log("joinRoom ignored"),n(a);var b={};return b.meta=e(f.child(a)),b.messages=d(g.child(a)),o.list.push(b),b},o.openEvent=function(b){a.path("/event/"+b)},o.acceptInvite=function(a){console.log("acceptInvite >> ",a),k(a)},o.rejectInvite=function(a){l(a)},o.inviteMember=function(a,c){console.log(a);for(var d=0;d<c.length;d++){var e=c[d],g=j.list[e];console.log("sending invite to >> ",g,e),f.child(a.meta.$id+"/members/"+e).set({username:g,role:"invitee"}).then(function(){console.log("invaitee added to room list, now sending the invite to him"),h.child(e).child("invites").child(a.meta.$id).set({toUserId:e,fromUserId:i.getId(),fromUserName:i.getUsername(),roomId:a.meta.$id,roomName:a.meta.name,time:b.ServerValue.TIMESTAMP})})}},o.createEvent=function(a,c,d){f.push({}).then(function(d){var e={id:d.key(),name:a,type:c?"private":"public",createdByUserId:i.getId(),createdAt:b.ServerValue.TIMESTAMP,invited:[],members:[]};e.members[i.getId()]={username:i.getUsername(),role:"Host"},d.set(e,function(a){a&&(console.error(a),window.alert("unable to create room main.js"));var c=d.key(),e={from:"info",fromUsername:i.getUsername(),time:b.ServerValue.TIMESTAMP,message:"Event created by "+i.getUsername()};g.child(c).push(e,function(a){o.openEvent(d.key())}),i.$ref().child("rooms").child(d.key()).set(b.ServerValue.TIMESTAMP,function(a){a&&(console.error(a),window.alert("Error removing the invite"))})})})},o.sendMessage=function(a,c){var d={from:i.getId(),fromUsername:i.getUsername(),time:b.ServerValue.TIMESTAMP,message:c};g.child(a).push(d,function(a){return a?(window.alert("there was an error sending the message"),!1):!0})},d(h.child(i.getId()).child("rooms")).$watch(function(a){console.log("new update from:",a),"child_added"===a.event||"child_changed"===a.event?o.join(a.key):"child_removed"===a.event?o.list.splice([m(a.key)],1):console.error("event is not handled",event)}),o.invites=d(h.child(i.getId()).child("invites")),o.discover=d(f.orderByChild("type").equalTo("public")),o}]),angular.module("onTimeApp").controller("MainCtrl",["Account","Events","UsersRef","RoomMetaRef","RoomMsgsRef","RoomUsersRef","$firebaseArray","$firebaseObject","$location","$scope",function(a,b,c,d,e,f,g,h,i,j){window.s=j,j.account=a,j.$location=i,j.awesomeThings="Awesome",j.events={},j.events.list=b.list,j.events.discover=b.discover,j.events.invites=b.invites,j.createEvent=b.createEvent,j.acceptInvite=b.acceptInvite,j.rejectInvite=b.rejectInvite,j.test=function(){window.alert("test2")},j.reload=function(){},j.openEvent=b.openEvent}]),angular.module("onTimeApp").controller("EventCtrl",["$scope","Account","Friends","Events","$location","$routeParams","$timeout","$cordovaGeolocation",function(a,b,c,d,e,f,g,h){a.$location=e,window.s=a,a.Events=d,a.account=b;var i=f.roomId,j=d.join(i);a.event=j,a.friends=c,a.invites=[],a.myId=b.getId(),console.log(a.event),a.sliderPreclose=function(a,b){console.log("pre close >>>",a,b)},a.sliderPostclose=function(){console.log("post close>>>")},a.sliderPreopen=function(a,b){console.log("pre open >>>",a,b)},a.sliderPostopen=function(a,b){console.log("post open >>",a,b)},a.sendMessage=function(a){a&&d.sendMessage(i,a)},a.inviteMembers=function(){console.log("invite members ",a.invites),d.inviteMember(j,a.invites),dialog.hide()},a.getMessageClass=function(a){return a.from===b.getId()?"sent-msg":"info"===a.from?"info-msg":"received-msg"},a.formatDate=function(a){var b=new Date(a),c=b.getHours()>12?b.getHours()-12:b.getHours(),d=b.getMinutes(),e=b.getHours()<12?" AM":" PM";return c+":"+d+e},a.isShowInvited=function(){return a.invited?a.invited.length>0:!1};var k=void 0;a.loadMap=function(){var a=platform.createDefaultLayers();k=new H.Map(document.getElementById("mapContainer"),a.normal.map,{center:new H.geo.Point(b.location.lat,b.location.lng),zoom:18});var c=new H.map.Icon('<svg version="1.1" id="Layer_12" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path d="M70.062,84.747H29.938L9.878,50l20.06-34.747h40.123L90.122,50L70.062,84.747z M31.671,81.747h36.658L86.658,50L68.329,18.253H31.671L13.342,50L31.671,81.747z"/></g></svg>'),d=new H.map.Marker({lng:b.location.lng,lat:b.location.lat},{icon:c}),e=new H.map.Circle({lng:b.location.lng,lat:b.location.lat},b.location.accuracy);k.addObject(d),k.addObject(e)}}]),angular.module("onTimeApp").controller("LoginCtrl",["$scope","Auth","$location","$q","UsersRef","$timeout",function(a,b,c,d,e,f){function g(){c.path("/")}a.passwordLogin=function(c,d){console.log("attempting to login"),a.err=null,b.$authWithPassword({email:c,password:d},{rememberMe:!0}).then(g,window.alert)},a.createAccount=function(){a.err=null,console.log(a.login),a.login.pass?a.login.pass!==a.login.confirm?window.alert("Passwords do not match!"):a.login.email?a.login.phone?a.login.username?(console.debug("creating user>>",a.login.email,a.login.pass),b.$createUser({email:a.login.email,password:a.login.pass}).then(function(c){return console.debug("authenticating"),b.$authWithPassword({email:a.login.email,password:a.login.pass},{rememberMe:!0})}).then(function(b){return console.debug("creating user profile",b),e.child(b.uid).set({email:a.login.email,username:a.login.username,phone:a.login.phone})}).then(function(){g()})["catch"](function(a){switch(console.error(a),a.code){case"EMAIL_TAKEN":window.alert("The new user account cannot be created because the email is already in use.");break;case"INVALID_EMAIL":window.alert("The specified email is not a valid email.");break;default:window.alert(a)}})):window.alert("Username is missing!"):window.alert("Phone number is missing!"):window.alert("Email is missing!"):window.alert("Please enter a password!")}}]),angular.module("onTimeApp").controller("AccountCtrl",["$scope","Account","Auth","FireRef","$firebaseObject","$timeout","$location",function(a,b,c,d,e,f,g){function h(a){j(a,"danger")}function i(a){j(a,"success")}function j(b,c){var d={text:b+"",type:c};a.messages.unshift(d),f(function(){a.messages.splice(a.messages.indexOf(d),1)},1e4)}a.$location=g,a.messages=[],a.account=b,a.logout=function(){c.$unauth(),b.fbo.$destroy(),b={}},a.changePassword=function(b,d,e){a.err=null,b&&d?d!==e?h("Passwords do not match"):c.$changePassword({email:profile.email,oldPassword:b,newPassword:d}).then(function(){i("Password changed")},h):h("Please enter all fields")},a.changeEmail=function(b,d){a.err=null,c.$changeEmail({password:b,newEmail:d,oldEmail:profile.email}).then(function(){profile.email=d,profile.$save(),i("Email changed")})["catch"](h)}}]),angular.module("onTimeApp").controller("FriendsCtrl",["$scope","Auth","Account","$location","Friends",function(a,b,c,d,e){window.s=a,a.account=c,a.friends={},a.friends.list=e.list,a.friends.requests=e.requests,a.$location=d,console.log("friends ctrlr is loaded"),a.friends.searchUsername=function(b){console.log("searching username",b),a.friends.search.results=e.searchUsername(b),a.friends.search.results.$loaded().then(function(){for(var b=0;b<a.friends.search.results.length;b++){var d=a.friends.search.results[b].$id;c.fbo.requests&&c.fbo.requests.sent&&c.fbo.requests.sent.hasOwnProperty(d)?a.friends.search.results[b].relation="requested":c.fbo.friends&&c.fbo.friends.hasOwnProperty(d)?a.friends.search.results[b].relation="friend":a.friends.search.results[b].relation="stranger"}})},a.test=function(){window.alert("test")},a.sendFriendRequest=function(a,b){console.log("sending friend request to >>"+a),console.log(c),e.sendFriendRequest(a,b)},a.acceptFriendRequest=function(a,b){e.acceptFriendRequest(a,b)},a.ignoreFriendRequest=function(a,b){e.ignoreFriendRequest(a,b)},a.cancelFriendRequest=function(a,b){e.cancelFriendRequest(a,b)},a.isReceived=function(){return e.requests?!!e.requests.received:!1},a.isSent=function(){return e.requests?!!e.requests.sent:!1}}]),angular.module("onTimeApp").filter("friendsFilter",function(){return function(a,b){if(!a)return a;if(!b)return a;var c=(""+b).toLowerCase(),d={};return angular.forEach(a,function(a,b){var e=(""+a).toLowerCase();-1!==e.indexOf(c)&&(d[b]=a)}),d}}),angular.module("onTimeApp").filter("reverse",function(){return function(a){return angular.isArray(a)?a.slice().reverse():[]}}),angular.module("onTimeApp").directive("ngShowAuth",["Auth","$timeout",function(a,b){"use strict";return{restrict:"A",link:function(c,d){function e(){b(function(){d.toggleClass("ng-cloak",!a.$getAuth())},0)}d.addClass("ng-cloak"),a.$onAuth(e),e()}}}]),angular.module("onTimeApp").directive("ngHideAuth",["Auth","$timeout",function(a,b){"use strict";return{restrict:"A",link:function(c,d){function e(){b(function(){d.toggleClass("ng-cloak",!!a.$getAuth())},0)}d.addClass("ng-cloak"),a.$onAuth(e),e()}}}]);