export default function UnauthorizedPage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
      <p className="text-gray-600 mt-2">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
