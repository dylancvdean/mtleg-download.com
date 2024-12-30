import React, { useState } from "react";

const App = () => {
  const [videoLink, setVideoLink] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!videoLink) {
      alert("Please enter a video link.");
      return;
    }

    setLoading(true);
    setDownloadLink(null);

    try {
      // Fetch the hearing page
      const response = await fetch(videoLink, {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0",
        },
      });
      const html = await response.text();

      // Extract m3u8 URL
      const m3u8Match = html.match(/"Url":"([^"]*\.m3u8)"/);
      if (!m3u8Match) {
        alert("m3u8 link not found.");
        setLoading(false);
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
        setLoading(false);
        return;
      }

      // Download all .ts files
      const tsBlobs = [];
      for (let i = 0; i < tsFiles.length; i++) {
        const fileUrl = `${baseUrl}/${tsFiles[i]}`;
        const tsResponse = await fetch(fileUrl);
        const tsBlob = await tsResponse.blob();
        tsBlobs.push(tsBlob);
      }

      // Concatenate .ts files into a single Blob
      const mp4Blob = new Blob(tsBlobs, { type: "video/mp4" });

      // Create a downloadable MP4 file
      const link = URL.createObjectURL(mp4Blob);
      setDownloadLink(link);
    } catch (error) {
      alert("An error occurred: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Video Downloader</h1>
      <div>
        <label>
          Enter Video Link:
          <input
            type="text"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            style={{ width: "100%", margin: "10px 0", padding: "8px" }}
          />
        </label>
      </div>
      <button onClick={handleDownload} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Downloading..." : "Download Video"}
      </button>
      {downloadLink && (
        <div style={{ marginTop: "20px" }}>
          <a href={downloadLink} download="output.mp4">
            Click here to download your video
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
