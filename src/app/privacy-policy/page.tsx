import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header"; import { Prose } from "@/components/layout/prose";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function PrivacyPolicyPage() {
return (
<>
<PageHeader title="Privacy Policy" />
<div className="container-x py-10">
<Prose>
<p>
This policy explains what information DeshConnect collects, why it collects it, and what choices you have.
It applies to all users of the platform, including visitors who are not signed in.
</p>
<h2>Information We Collect</h2>
<ul>
<li>
Account information you provide at registration—name, username, email, phone, address, and profile
details.
</li>
<li>Posts, comments, reviews, news submissions, and reports you create.</li>
<li>Donor information you share, consent status, and the consent expiry date.</li>
<li>Messages exchanged between members and connection requests.</li>
</ul>
<h2>Information Never Made Public Automatically</h2>
<ul>
<li>Passwords—stored only as a secure hash.</li>
<li>
Donor phone numbers and contact details—shown on the public donor listing only when you consent.
</li>
<li>Date of birth and personal address.</li>
<li>Private messages, friendship requests, and reports.</li>
</ul>
<h2>Consent</h2>
<p>
Registering as a donor is entirely voluntary. The decision to be listed and to share contact details
belongs to the donor. Donors can update availability or remove themselves from the directory at any time.
Removing a donor profile hides it from public listings and disables contact sharing; the record is retained
in the admin system. If not renewed, consent expires after one year.
</p>
<h2>Security</h2>
<p>
Authorization is verified not only at the interface but also at the server and database layers. Sensitive
information is visible only to its owner, and staff access is limited according to job needs.
</p>
<h2>Your Rights</h2>
<p>
You can edit or delete your own content, manage your donor profile, and contact us to request deletion of
your account.
</p>
</Prose>
</div>
</>
); }
