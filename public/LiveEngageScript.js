var appKey = '721c180b09eb463d9f3191c41762bb68',
    logsStarted = false,
    engagementData = {},
    getEngagementMaxRetries = 25,
    chatWindow,
	textLine,
   // chatContainer,
    chat,
    chatState,
    chatArea,
    logsLastChild;

initDemo();

function initDemo() {
    initChat(getEngagement);
}

function createCustomizedWindow(){
	chatWindow = document.getElementById('chatWindow');
	chatWindow.classList.remove("hidden");
	textLine = document.getElementById('textline');
	startChat();
}

function closeChatWindow(){
	chatWindow.classList.add('hidden');
}

function initChat(onInit) {
    var chatConfig = {
        lpNumber: site,
        appKey: appKey,
        onInit: [onInit, function (data) {
            writeLog('onInit', data);
        }],
        onInfo: function (data) {
            writeLog('onInfo', data);
        },
        onLine: [addLines, function (data) {
            writeLog('onLine', data);
        }],
        onState: [ updateChatState, function(data) {
            writeLog('onState', data);
        }],
        onStart: [updateChatState, bindEvents, bindInputForChat, function (data) {
            writeLog('onStart', data);
        }],
        onStop: [updateChatState, unBindInputForChat],
        onAddLine: function (data) {
            writeLog('onAddLine', data);
        },
        onAgentTyping: [agentTyping, function (data) {
            writeLog('onAgentTyping', data);
        }],
        onRequestChat: function (data) {
            writeLog('onRequestChat', data);
        },
        onEngagement: function (data) {
            if ('Available' === data.status) {
                createEngagement(data);
                writeLog('onEngagement', data);
            }
            else if ('NotAvailable' === data.status) {
                writeLog('onEngagement', data);
            }
            else {
                if (getEngagementMaxRetries > 0) {
                    writeLog('Failed to get engagement. Retry number ' + getEngagementMaxRetries, data);
                    window.setTimeout(getEngagement, 100);
                    getEngagementMaxRetries--;
                }
            }
        }
    };
    chat = new lpTag.taglets.ChatOverRestAPI(chatConfig);
}

function getEngagement() {
    chat.getEngagement();
}

function createEngagement(data) {
    var $engagement = $('<div id="LPMcontainer-1533529449053-0" class="LPMcontainer LPMoverlay" role="button" tabindex="0" style="margin: -86px 1px 1px auto; padding: 0px; border-style: solid; border-width: 0px; font-style: normal; font-weight: normal; font-variant: normal; list-style: none outside none; letter-spacing: normal; line-height: normal; text-decoration: none; vertical-align: baseline; white-space: normal; word-spacing: normal; background-repeat: repeat-x; background-position: left bottom; background-color: transparent; border-color: transparent; width: 40px; height: 172px; cursor: pointer; display: block; z-index: 107158; position: fixed; top: 50%; bottom: auto; left: auto; right: 0px;"><img src="https://personal.rbs.co.uk/content/dam/rbs_co_uk/WatsonDemo/RBS_NeedHelp_TAB_40x172.png" id="LPMimage-1533529449055-1" alt="Need Help?" class="LPMimage" style="margin: 0px; padding: 0px; border-style: none; border-width: 0px; font-style: normal; font-weight: normal; font-variant: normal; list-style: none outside none; letter-spacing: normal; line-height: normal; text-decoration: none; vertical-align: baseline; white-space: normal; word-spacing: normal; position: absolute; top: 0px; left: 0px; z-index: 600;"></div>');
    $engagement.click(function(){
        engagementData = data;
        //createWindow();
		createCustomizedWindow();
		document.getElementById("engagementPlaceholder").classList.add('hidden');
    });
    $engagement.appendTo($('#engagementPlaceholder'));
}

function startChat() {
    engagementData = engagementData || {};
    engagementData.engagementDetails = engagementData.engagementDetails || {};
    var chatRequest = {
        LETagVisitorId: engagementData.visitorId || engagementData.svid,
        LETagSessionId: engagementData.sessionId || engagementData.ssid,
        LETagContextId: engagementData.engagementDetails.contextId || engagementData.scid,
        skill: engagementData.engagementDetails.skillName,
        engagementId: engagementData.engagementDetails.engagementId || engagementData.eid,
        campaignId: engagementData.engagementDetails.campaignId || engagementData.cid,
        language: engagementData.engagementDetails.language || engagementData.lang
    };
    writeLog('startChat', chatRequest);
    chat.requestChat(chatRequest);
}

//Add lines to the chat from events
function addLines(data) {
	
    var linesAdded = false;
    for (var i = 0; i < data.lines.length; i++) {
        var line = data.lines[i];
        if (line.source !== 'visitor' || chatState != chat.chatStates.CHATTING) {
            var chatLine = createLine(line);
            addLineToDom(chatLine);
            linesAdded = true;
        }
    }
    if (linesAdded) {
        scrollToBottom();
    }
}

//Create a chat line
function createLine(line) {
	document.getElementById('lp_wait').classList.add("lpHide");
	

	var lineContainer = document.createElement('div');
	lineContainer.classList.add('lp_chat_line_wrapper');

	
	var infoDiv = document.createElement('div');
	infoDiv.classList.add("lp_time");
	infoDiv.style.cssText = 'color:#6D6E70;font-style:normal;font-family:Arial,Helvetica,sans-serif;font-weight:normal;';
	var infoDivChild = document.createElement('div');
	infoDivChild.classList.add('lp_sender');
	infoDiv.appendChild(infoDivChild);
	Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes();
	}
	const d = new Date();
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	

	
	var chatDiv = document.createElement('div');
	chatDiv.classList.add('lp_chat_line');
	var chatDivChild = document.createElement('div');
	chatDivChild.classList.add('lp_title_text');
	chatDiv.appendChild(chatDivChild);
	
	var formatDiv1 = document.createElement('div');
	formatDiv1.classList.add('lp_chat_arrow_border');
	
	var formatDiv2 = document.createElement('div');
	formatDiv2.classList.add('lp_chat_arrow');
		
	
	if (line.source === 'system') {
		lineContainer.classList.add('lp_system');
		infoDivChild.textContent = 'Info at ' + d.timeNow() + ', ' + monthNames[d.getMonth()] + ' ' + d.getDate() + ':';
		
		chatDiv.style.cssText = 'color:#6D6E70;font-style:normal;font-family:Arial,Helvetica,sans-serif;font-weight:normal;';
		chatDivChild.classList.add('lp_ltr');
		chatDivChild.style.cssText = 'color:#6D6E70;font-style:normal;font-family:Arial,Helvetica,sans-serif;font-weight:normal;';
		chatDivChild.innerHTML = line.text;
		
		lineContainer.appendChild(infoDiv);
		lineContainer.appendChild(chatDiv);
		lineContainer.appendChild(formatDiv1);
		lineContainer.appendChild(formatDiv2);
		
    } else if (line.source === 'agent'){
		lineContainer.classList.add('lp_agent', 'agent_avatar_display');
		infoDivChild.textContent = line.by + ' at ' + d.timeNow() + ', ' + monthNames[d.getMonth()] + ' ' + d.getDate() + ':';
		
		chatDiv.style.cssText = 'background-color:#0a2f64;border-color:#0a2f64;';
		chatDivChild.style.cssText = 'color:#FFFFFF;font-style:normal;font-family:Arial,Helvetica,sans-serif;font-weight:normal;';
		chatDivChild.innerHTML = line.text;
		
		formatDiv1.style.cssText = 'border-right-color:#0a2f64;';
		formatDiv2.style.cssText = 'border-right-color:#0a2f64;';
		
		lineContainer.appendChild(infoDiv);
		lineContainer.innerHTML = lineContainer.innerHTML + '<img class="agent_avatar" alt="" aria-hidden="true" src="https://personal.natwest.com/content/dam/natwest_com/WatsonDemo/RBS-cora-blue-icon-200x200.png">' ;
		lineContainer.appendChild(chatDiv);
		lineContainer.appendChild(formatDiv1);
		lineContainer.appendChild(formatDiv2);
		
    } else if (line.source === 'visitor'){
		lineContainer.classList.add('lp_visitor');
		infoDivChild.textContent = 'You at ' + d.timeNow() + ', ' + monthNames[d.getMonth()] + ' ' + d.getDate() + ':';
		
		formatDiv1.style.cssText = 'border-left-color:#b6b6b6;';
		formatDiv2.style.cssText = 'border-left-color:#FFFFFF;';
		
		var span1 = document.createElement("span");
		span1.classList.add('lp_title_text', 'lp_ltr');
		span1.style.cssText = 'color:#404041;font-style:normal;font-family:Arial,Helvetica,sans-serif;font-weight:normal;';
		span1.textContent = line.text;
		
		var span2 = document.createElement("span");
		span2.classList.add('lp_line_state');
		span2.style.cssText = 'color:#6D6E70;font-style:normal;font-family:Arial,Helvetica,sans-serif;font-weight:normal;';
		
		var wrapper = document.createElement('div');
		wrapper.classList.add('lp_line_state_wrapper');
		wrapper.appendChild(span1);
		wrapper.appendChild(span2);
		
		chatDiv.style.cssText = 'background-color:#FFFFFF;border-color:#b6b6b6;';
		chatDiv.removeChild(chatDivChild);
		chatDiv.appendChild(formatDiv1);
		chatDiv.appendChild(formatDiv2);
		chatDiv.appendChild(wrapper);		
		
		lineContainer.appendChild(infoDiv);
		lineContainer.appendChild(chatDiv);
		
    }
	
	return lineContainer;
}

//Add a line to the chat view DOM
function addLineToDom(line) {
    if (!chatArea) {
        chatArea = document.getElementById('lines_area');
        //chatArea = chatArea && chatArea[0];
    }
    chatArea.appendChild(line);
}

//Scroll to the bottom of the chat view
function scrollToBottom() {
    var scrollDiv = document.getElementById('scroll_div');
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
}

//Sends a chat line
function sendLine() {
    var text = textLine.value;
    if (text && chat) {
        var line = createLine({
            by: chat.getVisitorName(),
            text: text,
            source: 'visitor'
        });

        chat.addLine({
            text: text,
            error: function () {
                line.className = 'error';
            }
        });
        addLineToDom(line);
        textLine.value = '';
        scrollToBottom();
    }
}

//Listener for enter events in the text area
function keyChanges(e) {
    e = e || window.event;
    var key = e.keyCode || e.which;
    if (key == 13) {
        if (e.type == 'keyup') {
            sendLine();
            setVisitorTyping(false);
        }
        return false;
    } else {
        setVisitorTyping(true);
    }
}

//Set the visitor typing state
function setVisitorTyping(typing) {
    if (chat) {
        chat.setVisitorTyping({typing: typing});
    }
}

//Set the visitor name - Not Using
function setVisitorName() {
    var name = document.getElementById('#visitorName').val();
    if (chat && name) {
        chat.setVisitorName({visitorName: name});
    }
}

//Ends the chat
function endChat() {
    if (chat) {
        chat.endChat({
            disposeVisitor: true,
            success: function () {
                closeChatWindow();
				document.getElementById("engagementPlaceholder").classList.remove('hidden');
            }
        });
    }
}

//Sends an email of the transcript when the chat has ended - Not Using
function sendEmail() {
    var email = document.getElementById('#emailAddress').val();
    if (chat && email) {
        chat.requestTranscript({email: email});
    }
}

//Sets the local chat state
function updateChatState(data){
    if (data.state === 'ended' && chatState !== 'ended') {
        chat.disposeVisitor();
    }
    chatState = data.state;
}

//Mic
function listenMic(){
	fetch('/api/speech-to-text/token')
    .then(function(response) {
      return response.text();
    }).then(function (token) {

      var stream = WatsonSpeech.SpeechToText.recognizeMicrophone({
        token: token,
		customization_id: 'b7dc142d-9a4b-429a-af0d-0bd99b09cabd',
        outputElement: '#textline' // CSS selector or DOM Element
      });

      stream.on('data', function(data) {
        if(data.results[0] && data.results[0].final) {
          stream.stop();
		  textLine.value = data.results[0].alternatives[0].transcript;
		  sendLine();
          setVisitorTyping(false);
          console.log(data.results[0]);
        }
      });

      stream.on('error', function(err) {
        console.log(err);
      });

    }).catch(function(error) {
      console.log(error);
    });
}

function agentTyping(data) {
    if (data.agentTyping) {
		var div = document.getElementById('agent_is_typing');
		div.classList.remove("lpHide");
        
    } else {
        var div = document.getElementById('agent_is_typing');
		div.classList.add("lpHide");
    }
}

function bindInputForChat() {
    var sendButton = document.getElementById('sendButton');
	sendButton.disabled = false;
	sendButton.addEventListener("click", sendLine, false);
    
	textLine.addEventListener("keyup",keyChanges);
	textLine.addEventListener("keydown",keyChanges);
	
	document.getElementById('micButton').addEventListener("click", listenMic, false);
}

function unBindInputForChat() {
    document.getElementById('sendButton').removeEventListener("click", sendLine);
    textLine.removeEventListener("keyup",keyChanges);
    textLine.removeEventListener("keydown",keyChanges);
}

function bindEvents() {
    document.getElementById('closeChat').addEventListener("click", endChat, false);
	
}

function writeLog(logName, data) {
    var log = document.createElement('DIV');
    try {
        data = typeof data === 'string' ? data : JSON.stringify(data);
    } catch (exc) {
        return;
    }
    var time = new Date().toTimeString().slice(0,8);
    log.innerHTML = time + ' ' + logName + (data ? ' : ' + data : '');
    if (!logsStarted) {
        document.getElementById('logs').appendChild(log);
        logsStarted = true;
    } else {
        document.getElementById('logs').insertBefore(log, logsLastChild);
    }
    logsLastChild = log;

}