const examples = [
 {label:'01 / Confirm the intention',title:'What should this feature do?',body:'Only the client who owns a milestone may approve it. A different client and a freelancer must be denied.',detail:'“Only the owning client may approve.”',note:'The prepared exercise deliberately contains an ownership bug.'},
 {label:'02 / Understand the logic',title:'Follow the rule into the code.',body:'An explanation connects the requirement to relevant source locations. Open the actual function in your editor and inspect the decision.',detail:'Requirement → approval handler → permission function',note:'A source-linked explanation is an interpretation, not an executed check.'},
 {label:'03 / Predict before running',title:'What will this code allow?',body:'Decide whether a different client can approve. Save your prediction and reasoning before revealing what happens.',detail:'Prediction saved first. Case run second.',note:'The extension locks a prediction before its prepared case runs.'},
 {label:'04 / Observe the behavior',title:'The code allowed it. Why?',body:'In the deliberately broken example, the function checks the client role but does not check who owns the milestone.',detail:'Example: required denial → observed approval',note:'Illustrated result only. No test has been executed by this website.'},
 {label:'05 / Make the next change',title:'You make the edit.',body:'Use a conceptual hint, inspect the relevant values and change the condition yourself. Save your code and review its native before/after diff.',detail:'Investigate → edit → save → inspect diff',note:'The coach supplies guidance; it does not write the patch for you.'},
 {label:'06 / Verify the change',title:'Check the rule against the cases.',body:'Run the prepared ownership cases on the saved edit: owner allowed, another client denied, freelancer denied.',detail:'Requirement + saved code + executed outcomes',note:'Passing these cases establishes this behavior. It does not measure mastery.'},
];
const controls = document.querySelectorAll('[data-step]');
for (const control of controls) control.addEventListener('click', () => {
 const example = examples[Number(control.dataset.step)];
 for (const item of controls) item.removeAttribute('aria-current');
 control.setAttribute('aria-current','step');
 for (const [id,key] of [['example-label','label'],['example-title','title'],['example-body','body'],['example-note','note']]) document.getElementById(id).textContent = example[key];
 document.querySelector('#example-detail p:last-child').textContent = example.detail;
});
const themeButton = document.querySelector('.theme-toggle');
let dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
function renderTheme() {
 document.documentElement.dataset.theme = dark ? 'dark' : 'light';
 themeButton.setAttribute('aria-pressed',String(dark));
 themeButton.setAttribute('aria-label',`Switch to ${dark ? 'light' : 'dark'} theme`);
}
renderTheme();
themeButton.addEventListener('click', () => { dark = !dark; renderTheme(); });
