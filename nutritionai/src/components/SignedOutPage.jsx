import { SignInButton } from "@clerk/clerk-react";

function SignedOutPage(props) {

    return (
        <div>
            <h1>DrawAIng</h1>
            <p>Please create an account or sign in!</p>
            <SignInButton mode="modal">
                <button>Sign In</button>
            </SignInButton>
        </div>
    )
}

export default SignedOutPage;