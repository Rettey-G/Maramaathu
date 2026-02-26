import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Language = 'en' | 'dv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isDhivehi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const enTranslations: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.customer': 'Customer',
  'nav.worker': 'Worker',
  'nav.admin': 'Admin',
  'nav.profile': 'Profile',
  'nav.logout': 'Logout',
  'nav.login': 'Login',
  
  // Common
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.create': 'Create',
  'common.update': 'Update',
  'common.submit': 'Submit',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.all': 'All',
  'common.active': 'Active',
  'common.inactive': 'Inactive',
  'common.status': 'Status',
  'common.actions': 'Actions',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.phone': 'Phone',
  'common.password': 'Password',
  'common.confirmPassword': 'Confirm Password',
  'common.optional': 'Optional',
  'common.required': 'Required',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.warning': 'Warning',
  'common.info': 'Info',
  
  // Language
  'language.title': 'Language',
  'language.english': 'English',
  'language.dhivehi': 'Dhivehi',
  'language.toggle': 'Toggle Language',
  
  // Auth
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.signOut': 'Sign Out',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.resetPassword': 'Reset Password',
  'auth.createAccount': 'Create Account',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.dontHaveAccount': "Don't have an account?",
  'auth.continueWithGoogle': 'Continue with Google',
  'auth.orContinueWith': 'Or continue with',
  'auth.enterEmail': 'Enter your email',
  'auth.enterPassword': 'Enter your password',
  'auth.enterName': 'Enter your full name',
  'auth.enterPhone': 'Enter phone number',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.accountCreated': 'Account created successfully',
  'auth.passwordResetSent': 'Password reset email sent',
  'auth.checkEmail': 'Check your email for further instructions',
  
  // Role Selection
  'role.select': 'Select Your Role',
  'role.customer': 'Customer',
  'role.worker': 'Worker',
  'role.admin': 'Admin',
  'role.customerDesc': 'I need services done',
  'role.workerDesc': 'I provide skilled services',
  'role.adminDesc': 'I manage the platform',
  'role.continueAs': 'Continue as {role}',
  
  // Customer Dashboard
  'customer.dashboard': 'Customer Dashboard',
  'customer.newRequest': 'New Request',
  'customer.myRequests': 'My Requests',
  'customer.findWorkers': 'Find Workers',
  'customer.completedJobs': 'Completed Jobs',
  'customer.postNewRequest': 'Post a New Request',
  'customer.noRequests': 'No requests yet',
  'customer.createFirst': 'Create your first service request',
  'customer.requestDetails': 'Request Details',
  'customer.category': 'Category',
  'customer.description': 'Description',
  'customer.budget': 'Budget (MVR)',
  'customer.urgency': 'Urgency',
  'customer.location': 'Location',
  'customer.postRequest': 'Post Request',
  'customer.selectCategory': 'Select a category',
  'customer.selectUrgency': 'Select urgency level',
  'customer.urgency.low': 'Low',
  'customer.urgency.medium': 'Medium',
  'customer.urgency.high': 'High',
  'customer.urgency.emergency': 'Emergency',
  'customer.interestedWorkers': 'Interested Workers',
  'customer.noInterest': 'No workers interested yet',
  'customer.selectWorker': 'Select Worker',
  'customer.viewProfile': 'View Profile',
  'customer.accept': 'Accept',
  'customer.reject': 'Reject',
  'customer.quote': 'Quote',
  'customer.quotes': 'Quotes',
  'customer.noQuotes': 'No quotes yet',
  'customer.approveQuote': 'Approve Quote',
  'customer.inspection': 'Inspection',
  'customer.scheduleInspection': 'Schedule Inspection',
  'customer.confirmInspection': 'Confirm Inspection',
  'customer.inspectionCompleted': 'Inspection Completed',
  'customer.workScheduled': 'Work Scheduled',
  'customer.confirmCompletion': 'Confirm Completion',
  'customer.payment': 'Payment',
  'customer.markAsPaid': 'Mark as Paid',
  'customer.leaveReview': 'Leave Review',
  'customer.rating': 'Rating',
  'customer.review': 'Review',
  'customer.submitReview': 'Submit Review',
  
  // Categories
  'category.ac': 'AC Repair',
  'category.plumbing': 'Plumbing',
  'category.electrical': 'Electrical',
  'category.carpentry': 'Carpentry',
  'category.painting': 'Painting',
  'category.cleaning': 'Cleaning',
  'category.other': 'Other',
  
  // Worker Dashboard
  'worker.dashboard': 'Worker Dashboard',
  'worker.profile': 'Worker Profile',
  'worker.editProfile': 'Edit Profile',
  'worker.skills': 'Skills',
  'worker.categories': 'Categories',
  'worker.experience': 'Experience',
  'worker.rating': 'Rating',
  'worker.jobsDone': 'Jobs Done',
  'worker.about': 'About',
  'worker.contact': 'Contact',
  'worker.whatsapp': 'WhatsApp',
  'worker.viber': 'Viber',
  'worker.addSkill': 'Add Skill',
  'worker.addCategory': 'Add Category',
  'worker.availableJobs': 'Available Jobs',
  'worker.myJobs': 'My Jobs',
  'worker.completedJobs': 'Completed Jobs',
  'worker.browseRequests': 'Browse Requests',
  'worker.noJobs': 'No jobs available',
  'worker.showInterest': "I'm Interested",
  'worker.submitQuote': 'Submit Quote',
  'worker.quoteAmount': 'Quote Amount (MVR)',
  'worker.quoteNotes': 'Quote Notes',
  'worker.proposeInspection': 'Propose Inspection',
  'worker.inspectionDate': 'Inspection Date',
  'worker.inspectionNotes': 'Inspection Notes',
  'worker.scheduleWork': 'Schedule Work',
  'worker.workDate': 'Work Date',
  'worker.markComplete': 'Mark as Complete',
  'worker.requestPayment': 'Request Payment',
  'worker.paymentStatus': 'Payment Status',
  'worker.pending': 'Pending',
  'worker.paid': 'Paid',
  
  // Admin Dashboard
  'admin.dashboard': 'Admin Dashboard',
  'admin.overview': 'Overview',
  'admin.users': 'Users',
  'admin.workers': 'Workers',
  'admin.customers': 'Customers',
  'admin.jobs': 'Jobs',
  'admin.totalUsers': 'Total Users',
  'admin.totalWorkers': 'Total Workers',
  'admin.totalCustomers': 'Total Customers',
  'admin.totalJobs': 'Total Jobs',
  'admin.recentActivity': 'Recent Activity',
  'admin.userManagement': 'User Management',
  'admin.createUser': 'Create User',
  'admin.createCustomer': 'Create Customer',
  'admin.createWorker': 'Create Worker',
  'admin.resetPassword': 'Reset Password',
  'admin.newPassword': 'New Password',
  'admin.activate': 'Activate',
  'admin.deactivate': 'Deactivate',
  'admin.deleteUser': 'Delete User',
  'admin.confirmDelete': 'Are you sure you want to delete this user?',
  'admin.userCreated': 'User created successfully',
  'admin.passwordReset': 'Password reset successfully',
  'admin.userDeleted': 'User deleted successfully',
  'admin.userUpdated': 'User updated successfully',
  'admin.role': 'Role',
  'admin.active': 'Active',
  'admin.joined': 'Joined',
  'admin.lastActive': 'Last Active',
  'admin.allJobs': 'All Jobs',
  'admin.jobDetails': 'Job Details',
  'admin.customer': 'Customer',
  'admin.assignedWorker': 'Assigned Worker',
  'admin.jobStatus': 'Job Status',
  'admin.viewAll': 'View All',
  
  // Status
  'status.open': 'Open',
  'status.pending': 'Pending',
  'status.accepted': 'Accepted',
  'status.inProgress': 'In Progress',
  'status.completed': 'Completed',
  'status.cancelled': 'Cancelled',
  'status.awaitingQuote': 'Awaiting Quote',
  'status.quotePending': 'Quote Pending',
  'status.inspectionPending': 'Inspection Pending',
  'status.workScheduled': 'Work Scheduled',
  'status.workCompleted': 'Work Completed',
  'status.paymentPending': 'Payment Pending',
  
  // Errors
  'error.generic': 'Something went wrong',
  'error.network': 'Network error. Please check your connection',
  'error.timeout': 'Request timed out. Please try again',
  'error.unauthorized': 'Unauthorized. Please log in again',
  'error.notFound': 'Not found',
  'error.alreadyExists': 'Already exists',
  'error.invalidInput': 'Invalid input',
  'error.requiredField': 'This field is required',
  'error.invalidEmail': 'Please enter a valid email',
  'error.passwordTooShort': 'Password must be at least 6 characters',
  'error.passwordsDoNotMatch': 'Passwords do not match',
};

// Dhivehi translations
const dvTranslations: Record<string, string> = {
  // Navigation
  'nav.home': 'މައި',
  'nav.customer': 'ކަސްޓަމަރު',
  'nav.worker': 'ވާރކަރު',
  'nav.admin': 'އެޑްމިން',
  'nav.profile': 'ޕްރޮފައިލް',
  'nav.logout': 'ލޮގްއައުޓް',
  'nav.login': 'ލޮގިން',
  
  // Common
  'common.loading': 'ލޯޑިންވަނީ...',
  'common.save': 'ސޭވް',
  'common.cancel': 'ކެންސަލް',
  'common.delete': 'ޑިލީޓް',
  'common.edit': 'އެޑިޓް',
  'common.create': 'ކްރިއޭޓް',
  'common.update': 'އަޕްޑޭޓް',
  'common.submit': 'ސަބްމިޓް',
  'common.close': 'ކްލޯސް',
  'common.back': 'ބެކް',
  'common.next': 'ނެކްސްޓް',
  'common.search': 'ސަރޗް',
  'common.filter': 'ފިލްޓަރ',
  'common.sort': 'ސޯޓް',
  'common.all': 'އެންމެހާ',
  'common.active': 'އެކްޓިވް',
  'common.inactive': 'އިނއެކްޓިވް',
  'common.status': 'ސްޓޭޓަސް',
  'common.actions': 'އެކްޝަންސް',
  'common.name': 'ނަން',
  'common.email': 'އީމެއިލް',
  'common.phone': 'ފޯނު',
  'common.password': 'ޕާސްވޯޑް',
  'common.confirmPassword': 'ޕާސްވޯޑް ކަނޑުވާ',
  'common.optional': 'އޮޕްޝަނަލް',
  'common.required': 'މަޖުބޫރު',
  'common.error': 'އެރަރު',
  'common.success': 'ސަކްސެސް',
  'common.warning': 'ވޭނިންގް',
  'common.info': 'އިންފޯ',
  
  // Language
  'language.title': 'ބަސް',
  'language.english': 'އިނގިރޭސި',
  'language.dhivehi': 'ދިވެހި',
  'language.toggle': 'ބަސް ބަދަލުކުރޭ',
  
  // Auth
  'auth.signIn': 'ސައިން އިން',
  'auth.signUp': 'ސައިން އަޕް',
  'auth.signOut': 'ސައިން އައުޓް',
  'auth.forgotPassword': 'ޕާސްވޯޑް ހަނގާފަ؟',
  'auth.resetPassword': 'ޕާސްވޯޑް ރީސެޓްކުރޭ',
  'auth.createAccount': 'އެކައުންޓް ކްރިއޭޓްކުރޭ',
  'auth.alreadyHaveAccount': 'މިހާރު އެކައުންޓެއް އެބައި؟',
  'auth.dontHaveAccount': 'އެކައުންޓެއް ނެތޯ؟',
  'auth.continueWithGoogle': 'ގޫގަލްއިން ކޮންޓިނިއު',
  'auth.orContinueWith': 'ނުވަތަ',
  'auth.enterEmail': 'އީމެއިލް އެންޓަރުކުރޭ',
  'auth.enterPassword': 'ޕާސްވޯޑް އެންޓަރުކުރޭ',
  'auth.enterName': 'ފުރަތަމު ނަން އެންޓަރުކުރޭ',
  'auth.enterPhone': 'ފޯނު ނަންބަރު އެންޓަރުކުރޭ',
  'auth.invalidCredentials': 'އީމެއިލް ނުވަތަ ޕާސްވޯޑް ރަނގަޅުނުވާ',
  'auth.accountCreated': 'އެކައުންޓް ކްރިއޭޓްވިއެވެ',
  'auth.passwordResetSent': 'ޕާސްވޯޑް ރީސެޓް އީމެއިލް ފޮނުވިއެވެ',
  'auth.checkEmail': 'އިތުރު އިރުޝާދުތައް އީމެއިލް ޗެކްކުރޭ',
  
  // Role Selection
  'role.select': 'ތަރުތީބު ކުރޭ',
  'role.customer': 'ކަސްޓަމަރު',
  'role.worker': 'ވާރކަރު',
  'role.admin': 'އެޑްމިން',
  'role.customerDesc': 'ސާވިސް ބޭނުން',
  'role.workerDesc': 'ސާވިސް ދެއްކުން',
  'role.adminDesc': 'ޕްލެޓްފޯމް މެނޭޖްކުރުން',
  'role.continueAs': '{role} އަށް ކޮންޓިނިއު',
  
  // Customer Dashboard
  'customer.dashboard': 'ކަސްޓަމަރު ޑެޝްބޯޑް',
  'customer.newRequest': 'އައްޔަރު ރިކުއެސްޓް',
  'customer.myRequests': 'މަގެ ރިކުއެސްޓްތައް',
  'customer.findWorkers': 'ވާރކަރުން ހޯދާ',
  'customer.completedJobs': 'ނިމުނު މަސައިކާ',
  'customer.postNewRequest': 'އައްޔަރު ރިކުއެސްޓް ޕޯސްޓްކުރޭ',
  'customer.noRequests': 'ރިކުއެސްޓްތައް ނެތް',
  'customer.createFirst': 'ފުރަތަމަ ރިކުއެސްޓް ކްރިއޭޓްކުރޭ',
  'customer.requestDetails': 'ރިކުއެސްޓް ޑިޓޭލްސް',
  'customer.category': 'ކެޓަގަރީ',
  'customer.description': 'ތަފްޞީލު',
  'customer.budget': 'ބަޖެޓް (މރ)',
  'customer.urgency': 'ދަތުރު',
  'customer.location': 'ލޮކޭޝަން',
  'customer.postRequest': 'ރިކުއެސްޓް ޕޯސްޓްކުރޭ',
  'customer.selectCategory': 'ކެޓަގަރީ ސިލެކްޓްކުރޭ',
  'customer.selectUrgency': 'ދަތުރުގެ މިންވަރު ސިލެކްޓްކުރޭ',
  'customer.urgency.low': 'އެންމެ ދަށް',
  'customer.urgency.medium': 'މެޑިއަމް',
  'customer.urgency.high': 'މަތި',
  'customer.urgency.emergency': 'އެމަރޖެންސީ',
  'customer.interestedWorkers': 'މަސައިކާ އެދޭ ވާރކަރުން',
  'customer.noInterest': 'މަސައިކާ އެދި ނެތް',
  'customer.selectWorker': 'ވާރކަރު ސިލެކްޓްކުރޭ',
  'customer.viewProfile': 'ޕްރޮފައިލް ބައްލަވާ',
  'customer.accept': 'ޤުބޫލުކުރޭ',
  'customer.reject': 'ރިޖެކްޓްކުރޭ',
  'customer.quote': 'ކޯޓް',
  'customer.quotes': 'ކޯޓްތައް',
  'customer.noQuotes': 'ކޯޓްތައް ނެތް',
  'customer.approveQuote': 'ކޯޓް އިޝްތިހާރުކުރޭ',
  'customer.inspection': 'އިންސްޕެކްޝަން',
  'customer.scheduleInspection': 'އިންސްޕެކްޝަން ޝެޑިއިއުލްކުރޭ',
  'customer.confirmInspection': 'އިންސްޕެކްޝަން ކަނޑުވާ',
  'customer.inspectionCompleted': 'އިންސްޕެކްޝަން ނިމުނު',
  'customer.workScheduled': 'މަސައިކާ ޝެޑިއިއުލްވީ',
  'customer.confirmCompletion': 'ނިމުނު ކަނޑުވާ',
  'customer.payment': 'ފައިސާ',
  'customer.markAsPaid': 'ފައިސާ ދެވުނު ކަނޑުވާ',
  'customer.leaveReview': 'ރިވިއު ދޭ',
  'customer.rating': 'ރޭޓިންގް',
  'customer.review': 'ރިވިއު',
  'customer.submitReview': 'ރިވިއު ސަބްމިޓްކުރޭ',
  
  // Categories
  'category.ac': 'އީސީ ރިޕެއަރ',
  'category.plumbing': 'ޕްލަމްބިންގް',
  'category.electrical': 'އިލެކްޓްރިކަލް',
  'category.carpentry': 'ކާޕަންޓަރީ',
  'category.painting': 'ޕޭންޓިންގް',
  'category.cleaning': 'ކުޅިއްޔާލުން',
  'category.other': 'އެހެނިހާ',
  
  // Worker Dashboard
  'worker.dashboard': 'ވާރކަރު ޑެޝްބޯޑް',
  'worker.profile': 'ވާރކަރު ޕްރޮފައިލް',
  'worker.editProfile': 'ޕްރޮފައިލް އެޑިޓްކުރޭ',
  'worker.skills': 'ސްކިލްސް',
  'worker.categories': 'ކެޓަގަރީތައް',
  'worker.experience': 'ތަޖުރިބާ',
  'worker.rating': 'ރޭޓިންގް',
  'worker.jobsDone': 'ނިމުނު މަސައިކާ',
  'worker.about': 'ތަފްޞީލު',
  'worker.contact': 'ގުޅުން',
  'worker.whatsapp': 'ވަޓްސެޕް',
  'worker.viber': 'ވައިބަރު',
  'worker.addSkill': 'ސްކިލް އިތުރުކުރޭ',
  'worker.addCategory': 'ކެޓަގަރީ އިތުރުކުރޭ',
  'worker.availableJobs': 'ލިބެން ހުންނަ މަސައިކާ',
  'worker.myJobs': 'މަގެ މަސައިކާ',
  'worker.completedJobs': 'ނިމުނު މަސައިކާ',
  'worker.browseRequests': 'ރިކުއެސްޓްތައް ބައްލަވާ',
  'worker.noJobs': 'މަސައިކާ ނެތް',
  'worker.showInterest': 'މަސައިކާ އަދި',
  'worker.submitQuote': 'ކޯޓް ސަބްމިޓްކުރޭ',
  'worker.quoteAmount': 'ކޯޓް މިންވަރު (މރ)',
  'worker.quoteNotes': 'ކޯޓް ނޯޓްސް',
  'worker.proposeInspection': 'އިންސްޕެކްޝަން ޕުރޯޕޯޒްކުރޭ',
  'worker.inspectionDate': 'އިންސްޕެކްޝަން ތާރީހު',
  'worker.inspectionNotes': 'އިންސްޕެކްޝަން ނޯޓްސް',
  'worker.scheduleWork': 'މަސައިކާ ޝެޑިއިއުލްކުރޭ',
  'worker.workDate': 'މަސައިކާ ތާރީހު',
  'worker.markComplete': 'ނިމުނު ކަނޑުވާ',
  'worker.requestPayment': 'ފައިސާ އެދޭ',
  'worker.paymentStatus': 'ފައިސާގެ ސްޓޭޓަސް',
  'worker.pending': 'އިންތިޒާރުކުރަނީ',
  'worker.paid': 'ދެވުނު',
  
  // Admin Dashboard
  'admin.dashboard': 'އެޑްމިން ޑެޝްބޯޑް',
  'admin.overview': 'އޯވަރވިއު',
  'admin.users': 'ޔޫސަރުން',
  'admin.workers': 'ވާރކަރުން',
  'admin.customers': 'ކަސްޓަމަރުން',
  'admin.jobs': 'މަސައިކާ',
  'admin.totalUsers': 'ޖުމްލަ ޔޫސަރުން',
  'admin.totalWorkers': 'ޖުމްލަ ވާރކަރުން',
  'admin.totalCustomers': 'ޖުމްލަ ކަސްޓަމަރުން',
  'admin.totalJobs': 'ޖުމްލަ މަސައިކާ',
  'admin.recentActivity': 'އެންމެ ފަހުގެ ހަރަކާތް',
  'admin.userManagement': 'ޔޫސަރު މެނޭޖްމެންޓް',
  'admin.createUser': 'ޔޫސަރު ކްރިއޭޓްކުރޭ',
  'admin.createCustomer': 'ކަސްޓަމަރު ކްރިއޭޓްކުރޭ',
  'admin.createWorker': 'ވާރކަރު ކްރިއޭޓްކުރޭ',
  'admin.resetPassword': 'ޕާސްވޯޑް ރީސެޓްކުރޭ',
  'admin.newPassword': 'އައްޔަރު ޕާސްވޯޑް',
  'admin.activate': 'އެކްޓިވްކުރޭ',
  'admin.deactivate': 'ޑިއެކްޓިވްޓްކުރޭ',
  'admin.deleteUser': 'ޔޫސަރު ޑިލީޓްކުރޭ',
  'admin.confirmDelete': 'މިޔޫސަރު ޑިލީޓްކުރަން ކަނޑުވަނީ ޔާގު؟',
  'admin.userCreated': 'ޔޫސަރު ކްރިއޭޓްވިއެވެ',
  'admin.passwordReset': 'ޕާސްވޯޑް ރީސެޓްވިއެވެ',
  'admin.userDeleted': 'ޔޫސަރު ޑިލީޓްވިއެވެ',
  'admin.userUpdated': 'ޔޫސަރު އަޕްޑޭޓްވިއެވެ',
  'admin.role': 'ރޯލް',
  'admin.active': 'އެކްޓިވް',
  'admin.joined': 'ޖޯއިންވީ',
  'admin.lastActive': 'އެންމެ ފަހަރު އެކްޓިވް',
  'admin.allJobs': 'އެންމެހާ މަސައިކާ',
  'admin.jobDetails': 'މަސައިކާ ޑިޓޭލްސް',
  'admin.customer': 'ކަސްޓަމަރު',
  'admin.assignedWorker': 'ވަރަދަނީ ވާރކަރު',
  'admin.jobStatus': 'މަސައިކާ ސްޓޭޓަސް',
  'admin.viewAll': 'އެންމެހާ ބައްލަވާ',
  
  // Status
  'status.open': 'އޮޕަން',
  'status.pending': 'އިންތިޒާރު',
  'status.accepted': 'ޤުބޫލުކުރެވިފައި',
  'status.inProgress': 'ކުރިއަށްދަނީ',
  'status.completed': 'ނިމުނު',
  'status.cancelled': 'ކެންސަލްވެފައި',
  'status.awaitingQuote': 'ކޯޓް އިންތިޒާރު',
  'status.quotePending': 'ކޯޓް ޕެންޑިންގް',
  'status.inspectionPending': 'އިންސްޕެކްޝަން ޕެންޑިންގް',
  'status.workScheduled': 'މަސައިކާ ޝެޑިއިއުލްވެފައި',
  'status.workCompleted': 'މަސައިކާ ނިމުފައި',
  'status.paymentPending': 'ފައިސާ ޕެންޑިންގް',
  
  // Errors
  'error.generic': 'މައްސަހަރެއް ދިމަވިއެވެ',
  'error.network': 'ނެޓްވޯރްކް އެރަރު. ކުރިނާ ޗެކްކުރޭ',
  'error.timeout': 'ވަގުތު ހުސްވިއެވެ. މަރުވަތަށް މަސައިކާ',
  'error.unauthorized': 'އަނގުރައިޒްވެފައި. ލޮގިންކޮށްލާ',
  'error.notFound': 'ނުފެނުނު',
  'error.alreadyExists': 'މިހާރު އެބައި',
  'error.invalidInput': 'ރަނގަޅުނުވާ އިންޕުޓް',
  'error.requiredField': 'މިފީލްޑް މަޖުބޫރު',
  'error.invalidEmail': 'ރަނގަޅު އީމެއިލެއް އެންޓަރުކުރޭ',
  'error.passwordTooShort': 'ޕާސްވޯޑް މަސްދަށުން 6 ކެރެކްޓަރު',
  'error.passwordsDoNotMatch': 'ޕާސްވޯޑްތައް ހަނގާ ނުވާ',
};

const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  dv: dvTranslations,
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'en' || saved === 'dv') ? saved : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
    // Apply font class to body
    if (lang === 'dv') {
      document.body.classList.add('dhivehi-font');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.body.classList.remove('dhivehi-font');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'dv' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isDhivehi: language === 'dv',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
