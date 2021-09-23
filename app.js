const app = new Vue({
    el: '#root',

    data: {
        contacts: [
            {
                name: 'Michele',
                avatar: '_1',
                visible: true,
                messages: [
                    {
                        date: '10/01/2020 15:30:55',
                        message: 'Hai portato a spasso il cane?',
                        status: 'sent'
                    },
                    {
                        date: '10/01/2020 15:50:00',
                        message: 'Ricordati di dargli da mangiare',
                        status: 'sent'
                    },
                    {
                        date: '10/01/2020 16:15:22',
                        message: 'Tutto fatto!',
                        status: 'received'
                    }
                ],
            },
            {
                name: 'Fabio',
                avatar: '_2',
                visible: true,
                messages: [
                    {
                        date: '20/03/2020 16:30:00',
                        message: 'Ciao come stai?',
                        status: 'sent'
                    },
                    {
                        date: '20/03/2020 16:30:55',
                        message: 'Bene grazie! Stasera ci vediamo?',
                        status: 'received'
                    },
                    {
                        date: '20/03/2020 16:35:00',
                        message: 'Mi piacerebbe ma devo andare a fare la spesa.',
                        status: 'received'
                    }
                ],
            },
            {
                name: 'Samuele',
                avatar: '_3',
                visible: true,
                messages: [
                    {
                        date: '28/03/2020 10:10:40',
                        message: 'La Marianna va in campagna',
                        status: 'received'
                    },
                    {
                        date: '28/03/2020 10:20:10',
                        message: 'Sicuro di non aver sbagliato chat?',
                        status: 'sent'
                    },
                    {
                        date: '28/03/2020 16:15:22',
                        message: 'Ah scusa!',
                        status: 'received'
                    }
                ],
            },
            {
                name: 'Luisa',
                avatar: '_io',
                visible: true,
                messages: [
                    {
                        date: '10/01/2020 15:30:55',
                        message: 'Lo sai che ha aperto una nuova pizzeria?',
                        status: 'sent'
                    },
                    {
                        date: '10/01/2020 15:50:00',
                        message: 'Si, ma preferirei andare al cinema',
                        status: 'received',
                    }
                ],
            },
        ],

        emoticons: [
            {
                id: 0,
                code: '😀',
            },
            {
                id: 1,
                code: '😁',
            },
            {
                id: 2,
                code: '😂',
            },
            {
                id: 3,
                code: '😃',
            },
            {
                id: 4,
                code: '😄',
            },
            {
                id: 5,
                code: '😅',
            },
            {
                id: 6,
                code: '😆',
            },
            {
                id: 7,
                code: '😇',
            },
            {
                id: 8,
                code: '😈',
            },
            {
                id: 9,
                code: '😉',
            },
            {
                id: 10,
                code: '😊',
            },
            {
                id: 11,
                code: '😋',
            },
            {
                id: 12,
                code: '😌',
            },
            {
                id: 13,
                code: '😍',
            },
            
        ],

        newMessageInput: '',

        activeContact: '',

        searchContactsInput: '',

        isSmileInputVisible: false,

        cursorPosition: null,

        recorder: null,
        chunks: [],
        isAudioRecording: false,
    },

    watch: {
        // search contacts
        searchContactsInput: function() {
            let inputSearch = this.searchContactsInput.toLowerCase();

            this.contacts.forEach( (elm) => {
                let name = elm.name.toLowerCase();

                if ( !name.includes( inputSearch ) ) {
                    elm.visible = false;
                } else {
                    elm.visible = true;
                }
            });
        },
    },

    methods: {
        displayChat: function(elm) {
            this.activeContact = elm;

            // auto scroll to the bottom of the chat 
            setTimeout( () => {this.scrollToBottomChat()},0); 
        },

        sendMessage: function(obj) {
            let date = new Date();
            let messageTime = `${date.getHours()}:${date.getMinutes()}`;

            obj.date = messageTime;

            this.activeContact.messages.push( obj );

            this.newMessageInput = '';
            this.isSmileInputVisible = false; 

            // auto reply to message
            setTimeout( () => {
                this.activeContact.messages.push( 
                    {
                        date: messageTime,
                        message: 'ok',
                        status: 'received',
                    }
                );   

                // auto scroll to the bottom of the chat 
                setTimeout( () => {this.scrollToBottomChat()},0);             
            }, 1000);
        },

        sendTextMessage: function() {

            let newMessage = {
                message: this.newMessageInput,
                status: 'sent',
            };

            // if message is only an emoticon => add propriety onlyEmoticon : true
            if ( this.newMessageInput.length == 2 ) {
                this.emoticons.forEach( (elm) => {
                    if ( elm.code == this.newMessageInput ) {
                        newMessage.onlyEmoticon = true;
                    }
                });
            }

            this.sendMessage(newMessage);
        },

        deleteMessage: function(id) {
            this.activeContact.messages.splice(id, 1);
        },

        showOptionsMessage: function(elm) {
            // hide prev open option dropdown
            this.contacts.forEach( (contact) => {
                contact.messages.forEach( (message) => {
                    Vue.set(message, 'showDropdown', false);
                });
            });

            // show options for message
            if ( elm != undefined ) {
                elm.showDropdown = true;
            }
        },

        addSmileToMessage: function(elm) {

            const spliceStr = (str, index, stringToAdd) => {
                return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
            }

            this.newMessageInput = spliceStr( this.newMessageInput, this.cursorPosition, elm.code );

        },

        showSmileInput: function() {
            (this.isSmileInputVisible) ? this.isSmileInputVisible = false : this.isSmileInputVisible = true;
        },

        scrollToBottomChat: function() {
            const chat = document.querySelector(".chat");
            chat.scrollTop = chat.scrollHeight;
        },

        saveCursorPosition: function() {
            this.cursorPosition = document.getElementById("text_message").selectionEnd;            
        },

        recordAudio: function() {
            let device = navigator.mediaDevices.getUserMedia({ audio: true });
            device.then((stream) => {
                this.recorder = new MediaRecorder(stream);
                this.recorder.start();
                this.recorder.ondataavailable = (event) => {
                    this.chunks.push(event.data);
                }
            });
            this.isAudioRecording = true;
        },

        stopRecording: function() {
            let audioURL;

            this.recorder.stop();
            this.recorder.onstop = () => {
                let blob = new Blob(this.chunks, { 'type' : 'audio/mp3;' });
                audioURL = window.URL.createObjectURL(blob);
                this.chunks = [];

                let newMessage = {
                    status: 'sent',
                    audioSRC: audioURL,
                };

                this.isAudioRecording = false;
                this.sendMessage(newMessage);
            }
        },
    },

    mounted: function() {
        // send message when press enter
        document.addEventListener('keydown', (event) => {
            if ( event.key == 'Enter' && this.newMessageInput != '' ) {
                this.sendTextMessage();
            }
        });

        // hide message option when change focus
        document.addEventListener('click', (event) => {
            if ( !event.target.classList.contains('messageFocus') ) {
                this.showOptionsMessage();
            }
        });
    },
});