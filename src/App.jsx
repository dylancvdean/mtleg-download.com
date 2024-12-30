import React, { useState } from "react";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadAndCombineTS = async () => {
    if (!videoUrl) {
      alert("Please enter a video link!");
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch the hearing page
      const response = await fetch(videoUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0",
        },
      });
      const html = await response.text();

      // Extract m3u8 URL
      const m3u8Match = html.match(/"Url":"([^"]*\.m3u8)"/);
      if (!m3u8Match) {
        alert("m3u8 link not found.");
        setIsProcessing(false);
        return;
      }
      const m3u8Url = m3u8Match[1];

      // Extract base URL for .ts segments
      const baseUrl = m3u8Url.replace(/\/playlist\.m3u8$/, "");

      // Fetch the m3u8 playlist
      const m3u8Response = await fetch(m3u8Url);
      const playlist = await m3u8Response.text();

      // Extract .ts file names from the playlist
      const tsFiles = playlist.match(/media_\d+\.ts/g);
      if (!tsFiles) {
        alert("No .ts segments found.");
        setIsProcessing(false);
        return;
      }

      // Download all .ts files
      const tsBlobs = [];
      for (let i = 0; i < tsFiles.length; i++) {
        const fileUrl = `${baseUrl}/${tsFiles[i]}`;
        console.log(`Downloading ${fileUrl}`);
        const tsResponse = await fetch(fileUrl);
        const tsBlob = await tsResponse.blob();
        tsBlobs.push(tsBlob);
      }

      // Concatenate .ts files into a single Blob
      const mp4Blob = new Blob(tsBlobs, { type: "video/mp4" });

      // Create a downloadable MP4 file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(mp4Blob);
      link.download = "output.mp4";
      link.textContent = "Download MP4";
      document.body.appendChild(link);
      link.click();

      alert("Download complete!");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the video.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Hearing Video Downloader</h1>
      <input
        type="text"
        placeholder="Enter hearing video link"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <button
        onClick={downloadAndCombineTS}
        disabled={isProcessing}
        style={{
          padding: "10px 20px",
          backgroundColor: isProcessing ? "gray" : "#007BFF",
          color: "white",
          border: "none",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
      >
        {isProcessing ? "Processing..." : "Download Video"}
      </button>
    </div>
  );
}

export default App;
