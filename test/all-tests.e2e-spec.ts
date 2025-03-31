/**
 * This file imports all E2E test files so they can be run in sequence with a single command
 */

// Main app tests
import './app.e2e-spec';

// Authentication tests
import './auth.e2e-spec';

// Aid Request related tests
import './aid-requests.e2e-spec';
import './recurring-requests.e2e-spec';
import './aid-centers.e2e-spec';

// Organization & Campaign tests
import './organizations.e2e-spec';
import './campaigns.e2e-spec';

// Statistics & Analytics
import './dashboard.e2e-spec';
import './reports.e2e-spec';
import './history.e2e-spec';

// User related features
import './donors.e2e-spec';
import './volunteers.e2e-spec';

// Map & Logistics
import './map.e2e-spec';
import './route-optimization.e2e-spec';

// Supporting features
import './education.e2e-spec';
import './faq.e2e-spec';

// Note: Tests will run in the order they are imported