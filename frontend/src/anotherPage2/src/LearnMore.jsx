import React from "react";
import "./index.css";

const LearnMore = () => {
  return (
    <div style={{ backgroundColor: "#f0eee6", padding: "20px" }}>
      <header style={{ textAlign: "center", fontSize: "28px", fontWeight: "bold", marginBottom: "20px", color: "#005f73" }}>
        Learn More About Our AI Plant Disease Detection
      </header>
      <section className="how-it-works">
        <h2>How It Works</h2>
        <p><strong>Step 1:</strong> The user enters the <strong>input</strong> in the app.</p>
        <p><strong>Step 2:</strong> The website sends the data to the <strong>backend server</strong>.</p>
        <p><strong>Step 3:</strong> If there is an image in the request then the LLM Agent has two tools, one for <strong>object detection</strong> and the other for <strong>image captioning</strong>.</p>
        <p><strong>Step 4:</strong> It invokes the <strong>transformers</strong> (<code>BlipProcessor</code>, <code>DetrForObjectDetection</code>) to <strong>label and caption</strong> the image.</p>
        <p><strong>Step 5:</strong> Then the <strong>labelled image</strong> is sent to the LLM again for analysis.</p>
        <p><strong>Step 6:</strong> The LLM then <strong>diagnoses</strong> the image and provides it to the user.</p>
      </section>
      <section className="benefits">
        <h2>Why Use Our AI?</h2>
        <ul>
          <li><strong>Image-Based Diagnosis</strong> – Post a picture of the infected plant or crop, and the AI model will scan visible symptoms to recommend possible diseases.</li>
          <li><strong>Text-Based Symptom Input</strong> – Users can describe their symptoms in text form, allowing the AI to suggest possible diagnoses.</li>
          <li><strong>Dynamic Follow-up</strong> – The AI can ask suitable follow-up questions based on user input to refine diagnosis accuracy.</li>
          <li><strong>Accessibility</strong> – A free, open-source AI platform accessible to farmers, gardeners, and researchers.</li>
          <li><strong>Early Intervention</strong> – Encourages early preventive measures to minimize crop loss and improve plant health management.</li>
          <li><strong>Cost-Effectiveness</strong> – The platform provides a free version to reduce costs for users.</li>
        </ul>
      </section>
      <section className="features">
        <h2>Platform Features</h2>
        <ul>
          <li><strong>Real-Time AI Analysis</strong> – Get instant feedback on plant health through advanced AI models.</li>
          <li><strong>User-Friendly Interface</strong> – A simple and intuitive interface designed for ease of use.</li>
          <li><strong>Community Support</strong> – Connect with other farmers and experts for shared knowledge and tips.</li>
        </ul>
      </section>
      <section className="future-development">
        <h2>Future Development</h2>
        <p>We aim to integrate satellite imaging for large-scale crop monitoring and expand AI capabilities to detect nutrient deficiencies along with diseases.</p>
      </section>
      <section className="cta" style={{ textAlign: "center" }}>
        <h2>Get Started Today</h2>
        <a href="signup.html" className="btn" style={{ display: "inline-block", backgroundColor: "#008cba", color: "white", padding: "12px 24px", textDecoration: "none", borderRadius: "6px", fontSize: "16px", transition: "background 0.3s ease-in-out" }}>Sign Up Now</a>
      </section>
    </div>
  );
};

export default LearnMore;
