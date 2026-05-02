const fs = require('fs');

let html = fs.readFileSync('admin/index.html', 'utf8');

const testSection = `
    <h2>Test Configurazione Email (SMTP)</h2>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <p>Verifica se le credenziali email (SMTP_USER e SMTP_PASS) sono configurate correttamente in Netlify.</p>
      <button onclick="testSMTP()" style="background: #333; color: #fff; border: none; padding: 8px 15px; cursor: pointer;">Test Connessione Email</button>
      <div id="smtpResult" style="margin-top: 10px; font-weight: bold;"></div>
    </div>
    
    <script>
      async function testSMTP() {
        const resEl = document.getElementById('smtpResult');
        resEl.innerText = "Test in corso...";
        resEl.style.color = "#333";
        try {
          const res = await fetch('/.netlify/functions/test-smtp');
          const data = await res.json();
          if (data.success) {
            resEl.innerText = "✅ Configurazione SMTP corretta! Connesso come: " + data.user;
            resEl.style.color = "green";
          } else {
            resEl.innerText = "❌ Errore SMTP: " + (data.error || "Errore sconosciuto");
            resEl.style.color = "red";
          }
        } catch (e) {
          resEl.innerText = "❌ Errore di rete durante il test.";
          resEl.style.color = "red";
        }
      }
    </script>
`;

html = html.replace('<h2>Invia Newsletter</h2>', testSection + '\n    <h2>Invia Newsletter</h2>');

fs.writeFileSync('admin/index.html', html);
