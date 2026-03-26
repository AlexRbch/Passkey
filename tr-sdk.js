// START
let iframe;
let requestID;

// START
let apikey, profileID, appID
let useCustom = false
const customCheckbox = document.getElementById('custom-param');
const customParamsDiv = document.getElementById('custom-params');
customCheckbox.addEventListener('change', function () {
    if (customCheckbox.checked) {
        console.log('custom params checked');
        customParamsDiv.style.display = 'block';
        useCustom = true
    } else {
        useCustom = false
        customParamsDiv.style.display = 'none';
    }
});


const textarea = document.getElementById('tmstkn');

textarea.addEventListener('dblclick', () => {
    document.getElementById("tmstkn").value = '3F1180FAA00F05FCE063AF598E0A9066';
    // You can replace this with any action you want
});


// START
let freshLoad = true
if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
        logMessage(`TR.com received event: `);
        logMessage(`${JSON.stringify(event.data, null, 2)}`);


        if (event.data.type === 'AUTH_COMPLETE') {
            const fido = JSON.stringify(event.data, null, 2);
            console.log(fido);
            const btn = document.createElement("button");
            btn.textContent = "GET payment Credentials";

            document.getElementById("btn-container").appendChild(btn);

            const pldGPC = {
                orderInformation: {
                    data: {
                        action: "GPC",
                        fidoBlob: event.data.assuranceData.fidoBlob,
                        idn: event.data.assuranceData.identifier
                    }
                }
            };


// обробник кліку
            btn.addEventListener("click", () => {
                fetch("SignPASSkey.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: JSON.stringify(pldGPC)
                })
                    .then(response => response.text())
                    .then(data => {
                        console.log("Відповідь:", data);
                        logMessage("Please find below your encoded payment credentials");
                        logMessage("************************************************");
                        logMessage("************************************************");
                        logMessage("\n");
                        logMessage(data);
                        logMessage("\n");
                        logMessage("\n");

                        logMessage("Please find below your MLE MESSAGE");
                        logMessage("************************************************");
                        logMessage("************************************************");
                        logMessage(JSON.parse(data).value);
                    })
                    .catch(error => console.error("Помилка:", error));
            });


        }


        if (event.data.type === 'AUTH_READY' && freshLoad) {
            requestID = event.data.requestID
            freshLoad = false
        }
    }, false)
}

// END
let envSrc, base

function initIframe() {
    freshLoad = true
    iframe = document.createElement('iframe');
    const env = document.getElementById('env-param').value;
    populateURLandQueryParams(env)

    envSrc = base + '?apikey=' + apikey + '&clientAppID=' + appID
    // envSrc = base + '?apikey=' + apikey + '&clientAppID=' + appID
    // envSrc = "https://localhost/vts-auth-page.html"

    logMessage("Step 1 - opening Iframe and subscribe for Events");
    logMessage("************************************************");
    logMessage("************************************************");
    logMessage("\n");
    logMessage("hitting src: " + envSrc);
    iframe.src = envSrc
    iframe.height = "360vh";

    // iframe.sandbox = "allow-scripts allow-same-origin"

    document.getElementById('coln3').appendChild(iframe);
    logMessage("Initialized vts-sdk iframe");
}

// START
function populateURLandQueryParams(env) {
    if (useCustom) {
        apikey = document.getElementById('custom-apikey').value;
        appID = document.getElementById('custom-appID').value;
    }

    switch (env) {
        case 'qa':
            if (!useCustom) {
                apikey = '6LZQJ0M69JUNW3VQ7NXP21tiaJHp9bCBqPk-4M1sCRQFz87gg'
                profileID = '1aceb72d-0e90-4a13-e40e-1809986b5801'
                appID = 'CybsSuperProfileTMS'
            }
            base = 'https://sbx.vts.auth.visa.com/vts-auth/authenticate'
            break
        case 'qa1':
            if (!useCustom) {
                apikey = '7FHE5LL5WUC6Y2B0TXJA21B552D9gwg-qst7xs6t7q93wnpO0'
                profileID = ''
                appID = 'CybsSuperProfileTMS'
            }
            base = 'https://sbx.vts.auth.visa.com/vts-auth/authenticate'
            break
        case 'qa2':
            if (!useCustom) {
                apikey = 'A749GMPFO5VG7D6SGMGS113p8sf9JeGzr6_2haC9F9m_ANtLM'
                profileID = '1aceb72d-0e90-4a13-e40e-1809986b5801'
                appID = 'VTSAUTH'
            }
            base = 'https://b2cp-vtscore-qa2b-2.oce-np-sm-ddp-p-en.trusted.visa.com/vts-auth/authenticate'
            break;
        case 'cert':
            if (!useCustom) {
                apikey = '9H8TH5TDVLAAVLNXA4G621mVuOaUGh3NF20nR9_4a8bNmwtxM'
                profileID = '46de2f60-62a7-ae96-5fcb-16d57f82b501'
                appID = 'AutoFill'
            }
            base = "https://b2cp-vtscore-qacertb-3.oce-np-sm-ddp-p-en.trusted.visa.com/vts-auth/authenticate"
            break;
        case 'sbx':
            if (!useCustom) {
                apikey = 'KGV1B0955EAL7ISUHGHM21j3Nhb6ZIAXaz8_PVNBKeqAgYhq0'
                profileID = '6513e335-0611-7033-027b-17a258a35501'
                appID = 'ecomEnabler'
            }
            base = 'https://sbx.vts.auth.visa.com/vts-auth/authenticate'
            break;
        default:
            break;
    }
}

// END

function handleInit(clientId) {
    logMessage("\n");
    logMessage("Step 2 - sending CREATE_AUTH_SESSION message to Iframe for session opening ");
    logMessage("************************************************");
    logMessage("************************************************");

    logMessage('running init:');
    iframe.contentWindow.postMessage(JSON.stringify({
        type: 'CREATE_AUTH_SESSION',
        requestID: requestID,
        version: '1',
        client: {
            id: clientId
        }
    }), '*');
}

function submitInitParam() {
    const clientId = document.getElementById('init-id').value;
    handleInit(clientId);
}

function handleAuth(authParam, authID, authIntg) {
    console.log(`authParam: ${authParam}`);

    let endpoint;
    if (authParam === 'REGISTER') {
        endpoint = "L29hdXRoMi9hdXRob3JpemF0aW9uL3JlcXVlc3QvaHViL3BheW1lbnQtY3JlZGVudGlhbC1iaW5kaW5n"
    } else if (authParam === 'AUTHENTICATE') {
        endpoint = "L29hdXRoMi9hdXRob3JpemF0aW9uL3JlcXVlc3QvaHViL3BheW1lbnQtY3JlZGVudGlhbC1hdXRoZW50aWNhdGlvbg=="
    }

    if (authIntg === 'iframe') {
        logMessage('running iframe auth:');
        let command = JSON.stringify({
            type: 'AUTHENTICATE',
            requestID: requestID,
            version: '1',
            authenticationContext: {
                identifier: authID,
                endpoint: endpoint,
                payload: document.getElementById('auth-payload').value,
                action: authParam,
                // START GENAI@GHCOPILOT
                authenticationPreferencesEnabled: {
                    responseType: "code",
                    responseMode: "com_visa_web_message"
                }
                // END GENAI@GHCOPILOT
            }
        });
        console.log(`auth command postmsg to existing iframe for REGISTER: ${command}`)
        iframe.contentWindow.postMessage(command, '*');
    } else if (authIntg === 'popup') {
        logMessage('running popup auth:');
        let popup = window.open(envSrc, "myPopup", 'width=560,height=560,popup');
        let command = JSON.stringify({
            type: 'AUTHENTICATE',
            requestID: requestID,
            version: '1',
            authenticationContext: {
                identifier: authID,
                endpoint: endpoint,
                payload: document.getElementById('auth-payload').value,
                action: authParam,
                // START GENAI@GHCOPILOT
                authenticationPreferencesEnabled: {
                    responseType: "code",
                    responseMode: "form_post"
                }
                // END GENAI@GHCOPILOT
            }
        });
        console.log(`auth command postmsging to popup: ${command}`)
        setTimeout(() => {
            popup.postMessage(command, '*');
            console.log("msg sent to popup")
        }, 2500);
    }
}

function submitAuthParam() {
    const authParam = document.getElementById('auth-param').value;
    const authID = document.getElementById('auth-id').value;
    const authIntg = document.getElementById('auth-intg').value;
    handleAuth(authParam, authID, authIntg);
}

function submitCloseParam() {
    handleClose()
}

function handleClose() {
    console.log('running close:');
    iframe.contentWindow.postMessage(JSON.stringify({
        requestID: requestID,
        version: '1', type: 'CLOSE_AUTH_SESSION'
    }), '*');
    // wait 2 seconds before removing iframe
    setTimeout(() => {
        iframe.remove();
        logMessage('Removed vts-sdk iframe');
    }, 1000);
}

function logMessage(message) {
    const logBox = document.getElementById('logBox');
    console.log(message)
    if (logBox) {
        logBox.value += message + '\n';
    }
}

function clearLog() {
    const logBox = document.getElementById('logBox');
    if (logBox) {
        logBox.value = '';
    }
}


function copySecureToken() {
    try {
        const logBox = document.getElementById('logBox');
        const secureToken = logBox.value.split('"secureToken": "')[1].split('"')[0];
        navigator.clipboard.writeText(secureToken);
        console.log(`Copied secure token.`);
    } catch (error) {
        console.error(`Error copying secure token.`);
    }
}

function copyFidoBlob() {
    try {
        const logBox = document.getElementById('logBox');
        const fidoBlob = logBox.value.split('"fidoBlob": "')[1].split('"')[0];
        navigator.clipboard.writeText(fidoBlob);
        console.log(`Copied fido blob.`);
    } catch (error) {
        console.error(`Error copying fido blob.`);
    }
}


function authoptionsTMS(e) {
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    logMessage("\n");
    logMessage("Step 3 - sending request to get authenticated options for Tokenized card Id ");
    logMessage("In URl we providing Tokenized card Id from Network tokenization process ");
    logMessage("\n");
    logMessage("tms/v2/tokenized-cards/****tokenizedCard.id****/authentication-options ");
    logMessage("\n");
    logMessage("************************************************");
    logMessage("************************************************");

    const btn = e && e.currentTarget ? e.currentTarget : null;
    const logBox = document.getElementById('logBox');
    const tmstokenEl = document.getElementById('tmstkn').value;

    let savedValue = localStorage.getItem("myGlobalVar");

    if (savedValue === null) {
        // Якщо немає — встановлюємо початкове значення
        savedValue = tmstokenEl;
        localStorage.setItem("myGlobalVar", savedValue);
    }

    console.log("Поточне значення:", savedValue);


    // Безпечніше діставати secureToken
    var raw = (logBox && logBox.value ? logBox.value : '');
    var secureToken = '';
    try {
        var parsed = JSON.parse(raw);
        secureToken = parsed && parsed.secureToken ? parsed.secureToken : '';
    } catch (err) {
        var m = raw.match(/"secureToken"\s*:\s*"([^"]+)"/);
        secureToken = m && m[1] ? m[1] : '';
    }

    if (!secureToken) {
        logMessage('Помилка: не знайдено secureToken');
        return;
    }

    var tmsToken = tmstokenEl;
    if (!tmsToken) {
        logMessage('Помилка: поле TMStoken порожнє');
        return;
    }
    var action = 'authoptionsTMS';
    const pld = {
        orderInformation: {
            data: {
                sessionToken: secureToken,
                TMStoken: tmsToken,
                action: action
            }
        }
    };

    if (btn) btn.disabled = true;

    fetch('./SignPASSkey.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(pld),
        credentials: 'same-origin'
    })
        .then(function (res) {

            var ok = res.ok;
            var status = res.status;
            var statusText = res.statusText;

            return res.text().then(function (text) {
                try {
                    logMessage("Auth options");

                    var json = JSON.parse(text);
                    logMessage(JSON.stringify(json, null, 2));
                    logMessage(json);

                    switch (json.action) {
                        case "AUTHENTICATE":
                            console.log("PAsskey already existed");
                            document.getElementById("auth-param").value = "AUTHENTICATE";
                            document.getElementById("auth-id").value = json.authenticationContext.id;
                            document.getElementById("auth-payload").value = json.authenticationContext.payload;
                            break;

                        case "STEP_UP_AUTHENTICATE":
                            console.log("We will create passkey now");
                            //Show the results
                            const data = json.stepUpOptions;

                            generateForm(data);

                            break;

                        default:
                            console.log("Невідомий тип автентифікації");
                    }
                } catch (e) {
                    logMessage(text);
                }
                if (!ok) throw new Error('HTTP ' + status + ' ' + statusText);
            });
        })
        .catch(function (err) {
            logMessage('Помилка: ' + (err && err.message ? err.message : err));
        })
        .finally(function () {
            if (btn) btn.disabled = false;
        });


}


function createOtpForm(containerId, postUrl) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }


    container.innerHTML = '';

    // Створюємо форму
    const form = document.createElement('form');
    form.id = 'otpForm';


    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'otp';
    input.placeholder = 'Введіть OTP';
    input.required = true;


    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Send OTP';


    form.appendChild(input);
    form.appendChild(button);


    container.appendChild(form);


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const otpValue = input.value.trim();
        if (otpValue === '') {
            alert('Будь ласка, введіть OTP');
            return;
        }

        const pldOTP = {
            orderInformation: {
                data: {
                    otp: otpValue,
                    action: "otp"
                }
            }
        };


        logMessage("\n");
        logMessage("Step 5 - sending our otp for validation  ");
        logMessage("In URl we providing Tokenized card Id from Network tokenization process ");
        logMessage("\n");
        logMessage("/tms/v2/tokenized-cards/****tokenizedCard.id****/authentication-options/validate ");
        logMessage("\n");
        logMessage("************************************************");
        logMessage("************************************************");


        // Відправка на сервер
        fetch(postUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: JSON.stringify(pldOTP)
        })
            .then(response => response.text())
            .then(data => {
                //alert('Відповідь сервера: ' + data);
                logMessage(data);
                var text = '[' + data.replace(/}\s*{/g, '},{') + ']';


                var json = JSON.parse(text);
                document.getElementById("auth-id").value = json[1].authenticationContext.id;
                document.getElementById("auth-payload").value = json[1].authenticationContext.payload;


            })
            .catch(error => {
                console.error('Помилка:', error);
            });
    });
}


function generateForm(jsonData) {

    const container = document.getElementById('options-container');
    container.innerHTML = '';


    const form = document.createElement('form');
    form.id = 'stepUpForm';

    jsonData.forEach(option => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'methods[]';
        checkbox.value = option.id;
        checkbox.id = option.id;

        const label = document.createElement('label');
        label.htmlFor = option.id;
        label.textContent = `${option.method} (${option.value})`;

        form.appendChild(checkbox);
        form.appendChild(label);


        if (option.source) {
            const link = document.createElement('a');
            link.href = `${option.source}?identifier=${encodeURIComponent(option.id)}&wpcallback=${encodeURIComponent('https://polka.requestcatcher.com/')}`;
            link.textContent = 'Yours 3Ds verification URL'; // Текст посилання
            link.target = '_blank';           // Відкрити в новій вкладці
            link.style.marginLeft = '8px';    // Відступ від лейблу

            form.appendChild(link);
        }


        form.appendChild(document.createElement('br'));
    });


    // Кнопка відправки
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Confirm';

    form.appendChild(submitBtn);


    document.getElementById('options-container').appendChild(form);

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        logMessage("\n");
        logMessage("Step 4 - sending our prefered type of authentification  ");
        logMessage("Step 4 - for 3D verification confrim that auth process is done ");
        logMessage("In URl we providing Tokenized card Id from Network tokenization process ");
        logMessage("\n");
        logMessage("/tms/v2/tokenized-cards/****tokenizedCard.id****/authentication-options/one-time-passwords ");
        logMessage("\n");
        logMessage("************************************************");
        logMessage("************************************************");


        const selectedCheckbox = this.querySelector('input[name="methods[]"]:checked');


        let selectedMethod = null;
        if (selectedCheckbox) {
            selectedMethod = selectedCheckbox.value;
            console.log("Вибраний метод:", selectedMethod);
        } else {
            console.log("Метод не вибрано");
            alert("Будь ласка, виберіть метод підтвердження!");
            return; // Зупиняємо відправку, якщо нічого не вибрано
        }

        let pldAUTH;

        if (jsonData[0].method === "APP_TO_APP") {


            pldAUTH = {
                orderInformation: {
                    data: {
                        authMethodId: selectedMethod,
                        action: "auth",
                        ds: "3ds"
                    }
                }
            };


        } else {

            pldAUTH = {
                orderInformation: {
                    data: {
                        authMethodId: selectedMethod,
                        action: "auth"
                    }
                }
            };

        }


        fetch('SignPASSkey.php', {
            method: 'POST',
            body: JSON.stringify(pldAUTH),
            credentials: 'same-origin'
        })
            .then(response => response.text())
            .then(data => {
                // alert("Сервер відповів: " + data);
                logMessage(data);
                //analize what will will receive   not otp in case 3ds


                var json = JSON.parse(data);
                logMessage(JSON.stringify(json, null, 2));
                logMessage(json);


                if (json.authenticationContext) {
                    document.getElementById("auth-param").value = "REGISTER";
                    document.getElementById("auth-id").value = json.authenticationContext.id;
                    document.getElementById("auth-payload").value = json.authenticationContext.payload;
                } else {
                    createOtpForm('otp-container', 'SignPASSkey.php');
                }


            })
            .catch(error => console.error('Помилка:', error));
    });
}


window.initIframe = initIframe;
window.submitInitParam = submitInitParam;
window.submitAuthParam = submitAuthParam;
window.submitCloseParam = submitCloseParam;
window.clearLog = clearLog;
window.copySecureToken = copySecureToken;
window.copyFidoBlob = copyFidoBlob;
