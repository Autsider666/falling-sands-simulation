const workerFunction = function () {
    self.onmessage = (event: MessageEvent) => {
        console.log(event.data);

        postMessage('Did you send this? '+event.data);
    };
};

//This stringifies the whole function
const codeToString = workerFunction.toString();
//This brings out the code in the bracket in string
const mainCode = codeToString.substring(codeToString.indexOf('{') + 1, codeToString.lastIndexOf('}'));
//convert the code into a raw data
const blob = new Blob([mainCode], { type: 'application/javascript' });
//A url is made out of the blob object and we're good to go
const scriptUrl = URL.createObjectURL(blob);

export default scriptUrl;