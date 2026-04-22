 async function extractTextFromPDF(file) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      return text;
    }
    const resultDiv = document.getElementById("result");


    document.getElementById("scanBtn").addEventListener("click", async () => {
      const file = document.getElementById("resumeFile").files[0];
      const jobDescription = document.getElementById("jobDescription").value;

      if (!file || !jobDescription) {
        alert("Please upload a resume and enter a job description.");
        return;
      }

      const resumeText = await extractTextFromPDF(file);

      const response = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, jobDescription })
      });

      const data = await response.json();

      const resultDiv = document.getElementById("result");
      if (data.error) {
        resultDiv.innerHTML = `<p style="color:red;">Error: ${data.error}</p>`;
      } else {
        resultDiv.innerHTML = `
          <h2>Match Score: ${Math.round(data.match_score * 100)}%</h2>
          <h3>Matched Keywords:</h3>
          <ul>${data.matched_keywords.map(k => `<li>${k}</li>`).join("")}</ul>
          <h3>Missing Keywords:</h3>
          <ul>${data.missing_keywords.map(k => `<li>${k}</li>`).join("")}</ul>
          <h3>Suggestions:</h3>
          <ul>${data.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>
        `;
      }
    });