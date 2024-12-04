import { SignInButton } from "@clerk/clerk-react";

function SignedOutPage(props) {
  return (
    <div className="responsive-container flex flex-col justify-center items-center h-screen">
      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-bold text-6xl">
        Nutrition AI
      </h1>
      <p className="mt-4 text-lg">Please create an account or sign in!</p>
      <SignInButton mode="modal">
        <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
          Sign In
        </button>
      </SignInButton>
    </div>
  );
}

export default SignedOutPage;
