import { Arrow, Control, Heading, Mark } from './ui.js';

export function Website({ enter }: { enter: () => void }) {
 return <div className="marketing">
  <header className="website-nav"><Mark /><Control className="primary" onClick={enter}>Back to your path <Arrow /></Control></header>
  <main className="page">
   <Heading title="Understand the code you build.">A local learning companion for your own project.</Heading>
   <section className="website-evidence">
    <div><span className="eyebrow">ONE QUESTION WORTH ASKING</span><h2>Follow the evidence.</h2></div>
    <div><p>Choose source from your project, confirm one rule and case, then record your prediction before investigating the result.</p>
     <ul><li>Path keeps the question, observation, verification, reflection and separate case together.</li><li>Project lets you inspect captured source and collect a reading bundle. Export the bundle before leaving the view.</li><li>Notebook keeps saved questions and reasoning available for review and export.</li></ul>
     <p>Project checks need your specific approval. Optional OpenAI teaching sends the source excerpt, rule and case to OpenAI only after your review and consent.</p>
     <p>Learning records stay in this browser at this address; source history is kept by the local host. Export your records before resetting or changing ports or browsers.</p>
     <p className="disclosure">Recorded activity does not establish mastery. Live teaching quality and learner outcomes remain unverified.</p>
     <Control className="primary" onClick={enter}>Return to your path <Arrow /></Control>
    </div>
   </section>
  </main>
  <footer className="website-footer"><Mark /><span>Vadhyar · Local browser companion</span></footer>
 </div>;
}
