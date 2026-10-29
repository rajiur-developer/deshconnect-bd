import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header"; import { Prose } from "@/components/layout/prose";
export const metadata: Metadata = { title: "Terms of Use" };
export default function TermsPage() {
return (
<>
<PageHeader title="Terms of Use" />
<div className="container-x py-10">
<Prose>
<p>
By using DeshConnect you agree to these terms. Please read them before submitting posts or content.
</p>
<h2>Your Account</h2>
<p>
You are responsible for activities that occur through your account. Keep your login credentials private,
and let us know promptly if you believe your account security has been compromised.
</p>
<h2>Your Submitted Content</h2>
<ul>
<li>
Community posts, comments, and reviews must be your own and must not be unlawful, defamatory, or
misleading.
</li>
<li>
Submitted news is first held for review and is not published until an editor approves it.
</li>
<li>
By submitting content to the platform, you grant DeshConnect permission to display it.
</li>
</ul>
<h2>Review and Enforcement</h2>
<p>
We may hide or remove content that violates these terms, and we may suspend accounts after repeated rule
violations. Moderators review reported items; reporters can track the progress of their reports.
</p>
<h2>Blood Donation</h2>
<p>
DeshConnect helps donors and requesters connect voluntarily. We do not guarantee donor eligibility, blood
availability, or medical suitability; we are not a medical service provider.
</p>
<h2>Directory</h2>
<p>
Directory details are provided as general guidance. Where possible, verification status and the date of the
last verification are shown; for important information, confirm directly with the relevant institution.
</p>
</Prose>
</div>
</>
); }
