<h1 id="squadautomortars">SquadAutoMortars</h1>
<p><a href="https://www.youtube.com/embed/uF3VQAWmt88"><img src="https://img.youtube.com/vi/uF3VQAWmt88/hqdefault.jpg" alt="Watch the video"></a></p>
<h2 id="overview">Overview</h2>
<p>SquadAutoMortars is a tool designed to enhance your gaming experience in Squad by automating mortar control and providing a synchronized map overlay. This tool is created with the goal of improving mortar adjustments and map coordination.</p>
<h2 id="requirements">Requirements</h2>
<ul>
<li>Windows operating system</li>
</ul>
<h2 id="features">Features</h2>
<ul>
<li><p><strong>Auto Mortars:</strong></p>
<p> Control mortars using OCR for precise adjustments.</p>
</li>
<li><p><strong>Sync Map:</strong></p>
<p> Capture a screenshot of the in-game map and overlay it with the squadmortar map.</p>
</li>
<li><p><strong>Quick Adjustments:</strong></p>
<p> Swiftly adjust mortars on command.</p>
</li>
</ul>
<h2 id="installation">Installation</h2>
<p>To download and install SquadAutoMortars:</p>
<ol>
<li>Go to <a href="https://github.com/Devil4ngle/squadmortar/releases">https://github.com/Devil4ngle/squadmortar/releases</a>.</li>
<li>Download the latest release by clicking on <code>squadautomortar.zip</code>.
Note: The release is approximately 300 MB due to included maps.</li>
<li>Unzip the downloaded file.</li>
<li>Inside the folder, run <code>squadmortar.exe</code> while squad is already running.</li>
</ol>
<h2 id="join-discord">Join Discord</h2>
<p>Feel free to join our Discord community for discussions, support, and updates: <a href="https://discord.gg/Qc5y4satdz">SquadAutoMortars Discord</a>.</p>
<h2 id="eac-ban-disclaimer">EAC Ban Disclaimer</h2>
<p>No, the usage of SquadAutoMortars does not violate Easy Anti-Cheat (EAC) policies. The program operates without attaching to or reading memory from the Squad game process. It solely captures screenshots using standard operating system APIs and sends keyboard inputs (a, w, s, d). The code is open source, providing transparency and assurance.</p>
<h2 id="single-monitor-usage">Single Monitor Usage</h2>
<p>If you only have one monitor, resizing Squad to a 1024x768 windowed mode is recommended for a more convenient experience. Refer to the demo video for guidance.</p>
<h2 id="supported-sizes">Supported Sizes</h2>
<ul>
<li>1024x768 windowed only</li>
<li>1920x1080, 2560x1440 borderless and fullscreen only</li>
</ul>
<h2 id="unsupported-screen-size">Unsupported Screen Size</h2>
<p>If your screen size is not supported, please join our Discord community for assistance: <a href="https://discord.gg/Qc5y4satdz">SquadAutoMortars Discord</a>.</p>
<h2 id="credits">Credits</h2>
<p>This tool is based on the original source code from the Squadmortar website by Miksu. You can find the original source at <a href="https://gitlab.com/squadstrat/squadmortar">https://gitlab.com/squadstrat/squadmortar</a>.</p>
<p>Feel free to explore the code and contribute to the project!</p>
<h2 id="development-notes">Development Notes</h2>
<ul>
<li>To compile the executable for JS, follow these steps:<ul>
<li>Download <a href="https://nodejs.org/download/release/v18.18.2/node-v18.18.2-x64.msi">Node.js v18.18.2</a>.</li>
<li>Run <code>npm install -g pkg</code> in the terminal.</li>
<li>Execute <code>pkg squadMortarServer.js -t=win</code> and <code>pkg imageLayering.js -t=win</code>.</li>
<li>Use <code>create-nodew-exe</code> to create silent versions: <code>create-nodew-exe squadMortarServer.exe squadMortarServerSilent.exe</code> and <code>create-nodew-exe imageLayering.exe imageLayeringSilent.exe</code>.</li>
</ul>
</li>
</ul>
