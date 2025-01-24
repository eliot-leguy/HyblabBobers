"use strict";

const initSlide2 = async function () {

  const chatBox = document.getElementById('chatBox');
  const messageList = document.getElementById('messageList');
  const messageInput = document.getElementById('messageInput');

  //displayExplanation({titre:"test"});
  scrollToBottom();

    // Retrieve the intro's messages from our API
    let response = await fetch('data/fr_.json');
    const texts = await response.json();


    // await histoire(texts.tech);

    // Load the intro story
    const userName = await loadIntroStory(texts.introduction.general);

    // Select the character
    // const character = await selectCharacter(texts.introduction.secteurs);

    // Select the character
    const secteur = await selectSecteur(texts.introduction.secteurs);

    switch (secteur) {
        case 0:
            await histoire(texts.agro);
            break;
        case 1:
            await histoire(texts.tech);
            break;
        case 2:
            await histoire(texts.arti);
            break;
    };
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForNameInput() {
    return new Promise((resolve) => {
      const sendButton = document.getElementById('messageSendButton');
      const messageInput = document.getElementById('messageInput');
  
      function onClick() {
        const value = messageInput.value.trim();
        sendButton.removeEventListener('click', onClick); // Stop listening once input is received
        messageInput.removeEventListener('keydown', event => {
            if (event.key === 'Enter') {
                onClick();
            }
        });
        resolve(value); // Resolve the Promise with the input value
      }
  
      sendButton.addEventListener('click', onClick);
      messageInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            onClick();
        }
    });
    });
  }

function waitForUserTouch(){
    return new Promise((resolve) => {
        const messageInput = document.getElementById('chatBox');
        messageInput.addEventListener('click', () => {
            resolve();
        });
    });
}


async function getUserName() {

    toggleTapIconDisplay(true);

    const messageInput = document.getElementById('messageInput');
    const chatInput = document.getElementById('chat-input');

    chatInput.style.visibility='visible';
    messageInput.focus();

    let userName = await waitForNameInput();

    messageInput.blur();
    chatInput.style.visibility='hidden';

    toggleTapIconDisplay(false);

    return userName;
}

async function displayMessages(message) {
    for (const key in message) {
        addMessage({ text: message[key], type: "received", timestamp: new Date().toISOString() });
        scrollToBottom();
        await waitForUserTouch();
    }
}

async function displayResponses(message) {
    for (const key in message) {
        addMessage({ text: message[key], type: "answer", timestamp: new Date().toISOString() });
        scrollToBottom();
    }
    await waitForUserTouch();
}

  
async function loadIntroStory(introStory) {
  document.getElementById('chat-input').style.visibility = 'hidden';

    await displayMessages(introStory.avant_nom);

    const userName = await getUserName();
    await addMessage({ text: userName, type: "sent", timestamp: new Date().toISOString() });

    let i=0;
    for (const key in introStory.apres_nom) {
        if (i === 0) {
            i++;
            addMessage({ text: introStory.apres_nom[key].replace("{nom}", userName), type: "received", timestamp: new Date().toISOString() });
        } else {
            addMessage({ text: introStory.apres_nom[key], type: "received", timestamp: new Date().toISOString() });

        }
        scrollToBottom();
        await waitForUserTouch();
    }

    return userName;
}

  async function selectCharacter(textsPresentationPersos) {

    const images = [
        { src: 'img/perso1.png', alt: '1', index: 0 },
        { src: 'img/perso2.png', alt: '2', index: 1, active: true },
        { src: 'img/perso3.png', alt: '3', index: 2 }
      ];
      const carousel = new Carousel(images, ['text1', 'text2', 'text3']);
      await carousel.createCarousel();
      const char =  await carousel.getCharacter();
      carousel.activated = false;

      

      return char;
  }

  async function selectSecteur(textsPresentationPersos) {

    toggleTapIconDisplay(true);

    const images = [
        { src: 'img/agro.jpg', alt: '1', index: 0 },
        { src: 'img/tech.jpeg', alt: '2', index: 1, active: true },
        { src: 'img/arti.jpg', alt: '3', index: 2 }
      ];
      const carousel = new Carousel(images, [textsPresentationPersos.agro, textsPresentationPersos.tech, textsPresentationPersos.arti]);
      await carousel.createCarousel();
      const char =  await carousel.getCharacter();
      carousel.activated = false;

      toggleTapIconDisplay(false);

      return char;
  }
  

async function histoire(texts){

    let choices = [];

    await displayMessages(texts.introduction);

    for (let i = 0; i < texts.questions.length; i++) {
        await displayMessages(texts.questions[i]);

        /* Ouais bon la solution est dégeu, mais ça fonctionne */
        let multipleChoices = false;
        for(let key in texts.questions[i]){
           if(texts.questions[i][key].includes("financement")){
                multipleChoices = true;
                break;
           }
        }

        toggleTapIconDisplay(true);

        let answer = await addAnswer(texts.reponses[i], multipleChoices);
        choices = [...choices, ...answer];
        console.log(choices);

        toggleTapIconDisplay(false);
    }
}