import Editor from "../components/Editor";
import Background from "../components/Background";

export default function Home() {
  return (
    <>
      <Background />
      <main>
        <header>
          <h1>ASCII to image</h1>
          <p>Render ASCII art as an image, banner, or wallpaper.</p>
        </header>
        <Editor />
        <footer>
          <span>Your art stays in your browser.</span>
          <a href="https://smitp.cc/">smitp.cc</a>
        </footer>
      </main>
    </>
  );
}
