export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} しろねこプロジェクト All rights reserved.
      </div>
    </footer>
  );
}