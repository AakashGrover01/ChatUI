var appKey = '721c180b09eb463d9f3191c41762bb68',
    logsStarted = false,
    engagementData = {},
    getEngagementMaxRetries = 25,
    chatWindow,
	chatWindow2,
    chatContainer,
    chat,
    chatState,
    chatArea,
    logsLastChild;

initDemo();

function initDemo() {
    if (lptag === 'true') {
        createExternalJsMethodName();
    }
    else {
        initChat(getEngagement);
    }
}

function createExternalJsMethodName() {
    window.externalJsMethodName = function(data) {
        engagementData = data;
        initChat(createWindow);
    }
}

function createWindow() {
    chatWindow = $.window({
        width: 650,
        height: 500,
        title: 'Chat Demo',
        content: $('#chatWindow').html(),
        footerContent: $('#agentIsTyping').html(),
        onShow: function(){
            startChat();
        },
        onClose: function(){
            chatWindow = chatContainer = chatArea = null;
        }
    });
    chatContainer = chatWindow.getContainer();
}

function createCustomizedWindow(){
	chatWindow2 = document.getElementById('chatWindow2');
	chatWindow2.classList.remove("hidden");

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
        createWindow();
		createCustomizedWindow();
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
    var div = document.createElement('P');
    div.innerHTML = '<b>' + line.by + '</b>: ';
    if (line.source === 'visitor') {
        div.appendChild(document.createTextNode(line.text));
    } else {
        div.innerHTML += line.text;
    }
    return div;
}

//Add a line to the chat view DOM
function addLineToDom(line) {
    if (!chatArea) {
        chatArea = chatContainer.find('#chatLines');
        chatArea = chatArea && chatArea[0];
    }
    chatArea.append(line);
}

//Scroll to the bottom of the chat view
function scrollToBottom() {
    if (!chatArea) {
        chatArea = chatContainer.find('#chatLines');
        chatArea = chatArea && chatArea[0];
    }
    chatArea.scrollTop = chatArea.scrollHeight;
}

//Sends a chat line
function sendLine() {
    var $textline = chatContainer.find('#textline');
    var text = $textline.val();
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
        $textline.val('');
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

//Set the visitor name
function setVisitorName() {
    var name = chatContainer.find('#visitorName').val();
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
                chatWindow.close();
            }
        });
    }
}

//Sends an email of the transcript when the chat has ended
function sendEmail() {
    var email = chatContainer.find('#emailAddress').val();
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
		continuous: false,
		customization_id: 'b7dc142d-9a4b-429a-af0d-0bd99b09cabd',
        outputElement: '#textline' // CSS selector or DOM Element
      });

      stream.on('data', function(data) {
        if(data.results[0] && data.results[0].final) {
          stream.stop();
		  chatContainer.find('#textline').val(data.results[0].alternatives[0].transcript);
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
        chatWindow.setFooterContent('Agent is typing...');
    } else {
        chatWindow.setFooterContent('');
    }
}

function bindInputForChat() {
    chatContainer.find('#sendButton').removeAttr('disabled').click(sendLine);
    chatContainer.find('#chatInput').keyup(keyChanges).keydown(keyChanges);
}

function unBindInputForChat() {
    chatContainer.find('#sendButton').off();
    chatContainer.find('#chatInput').off();
}

function bindEvents() {
    chatContainer.find('#closeChat').click(endChat);
    chatContainer.find('#setvisitorName').click(setVisitorName);
    chatContainer.find('#sendTranscript').click(sendEmail);
	chatContainer.find('#micButton').click(listenMic);
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