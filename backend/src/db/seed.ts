import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  console.log('🌱 Starting refined database seeding (Hierarchy)...');

  // CLEANUP: Optional - Delete existing workspace with same slug to ensure clean state
  const existingWorkspace = await db.query.workspaces.findFirst({
    where: eq(schema.workspaces.slug, 'omnigize-hq'),
  });

  if (existingWorkspace) {
    console.log('🗑️ Removing existing "Omnigize HQ" workspace for clean seed...');
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, existingWorkspace.id));
  }

  // 1. Create Main Workspace
  const workspaceId = uuidv4();
  const [mainWorkspace] = await db.insert(schema.workspaces).values({
    id: workspaceId,
    name: 'Omnigize HQ',
    slug: 'omnigize-hq',
    industry: 'Technology',
    subscriptionTier: 'Enterprise',
  }).returning();

  console.log(`✅ Created workspace: ${mainWorkspace.name}`);

  // 2. Create Departments
  const [executiveDept] = await db.insert(schema.departments).values({
    id: uuidv4(),
    workspaceId: workspaceId,
    name: 'Executive',
  }).returning();

  const [salesDept] = await db.insert(schema.departments).values({
    id: uuidv4(),
    workspaceId: workspaceId,
    name: 'Sales',
  }).returning();

  const [supportDept] = await db.insert(schema.departments).values({
    id: uuidv4(),
    workspaceId: workspaceId,
    name: 'Customer Support',
  }).returning();

  console.log('✅ Created departments: Executive, Sales, Customer Support');

  // 3. Create Teams
  const [salesAlphaTeam] = await db.insert(schema.teams).values({
    id: uuidv4(),
    workspaceId: workspaceId,
    departmentId: salesDept.id,
    name: 'Sales Alpha',
    description: 'Lead conversion specialists',
  }).returning();

  const [supportEliteTeam] = await db.insert(schema.teams).values({
    id: uuidv4(),
    workspaceId: workspaceId,
    departmentId: supportDept.id,
    name: 'Support Elite',
    description: 'High-tier enterprise support',
  }).returning();

  console.log('✅ Created teams: Sales Alpha, Support Elite');

  // 4. Create Roles
  const [adminRole] = await db.insert(schema.roles).values({
    workspaceId: workspaceId,
    name: 'Admin',
    description: 'Full workspace access',
    isSystemRole: true,
  }).returning();

  const [managerRole] = await db.insert(schema.roles).values({
    workspaceId: workspaceId,
    name: 'Manager',
    description: 'Department management access',
    isSystemRole: true,
  }).returning();

  const [agentRole] = await db.insert(schema.roles).values({
    workspaceId: workspaceId,
    name: 'Agent',
    description: 'Standard operational access',
    isSystemRole: true,
  }).returning();

  console.log('✅ Created roles: Admin, Manager, Agent');

  // 5. Create Users (Hierarchy)
  const hashedPassword = await hash('Omnigize2026!', 10);

  // CEO / Admin
  const adminId = uuidv4();
  await db.insert(schema.users).values({
    id: adminId,
    workspaceId: workspaceId,
    departmentId: executiveDept.id,
    email: 'ucefhesham@gmail.com',
    passwordHash: hashedPassword,
    firstName: 'Ucef',
    lastName: 'Hesham',
    status: 'Active',
    isWorkspaceOwner: true,
  });
  await db.insert(schema.userRoles).values({ userId: adminId, roleId: adminRole.id });

  // Sales Manager
  const salesManagerId = uuidv4();
  await db.insert(schema.users).values({
    id: salesManagerId,
    workspaceId: workspaceId,
    departmentId: salesDept.id,
    email: 'sales.manager@example.com',
    passwordHash: hashedPassword,
    firstName: 'Alice',
    lastName: 'Manager',
    status: 'Active',
  });
  await db.insert(schema.userRoles).values({ userId: salesManagerId, roleId: managerRole.id });

  // Sales Agent (Alpha Team)
  const salesAgentId = uuidv4();
  await db.insert(schema.users).values({
    id: salesAgentId,
    workspaceId: workspaceId,
    departmentId: salesDept.id,
    teamId: salesAlphaTeam.id,
    email: 'sales.agent@example.com',
    passwordHash: hashedPassword,
    firstName: 'Bob',
    lastName: 'Agent',
    status: 'Active',
  });
  await db.insert(schema.userRoles).values({ userId: salesAgentId, roleId: agentRole.id });

  // Support Agent (Elite Support Team)
  const supportAgentId = uuidv4();
  await db.insert(schema.users).values({
    id: supportAgentId,
    workspaceId: workspaceId,
    departmentId: supportDept.id,
    teamId: supportEliteTeam.id,
    email: 'support.agent@example.com',
    passwordHash: hashedPassword,
    firstName: 'Charlie',
    lastName: 'Expert',
    status: 'Active',
  });
  await db.insert(schema.userRoles).values({ userId: supportAgentId, roleId: agentRole.id });

  console.log('✅ Created users hierarchy (Admin -> Manager -> Agent)');

  // 6. Seed CRM Data Linked to Agents
  const contactId = uuidv4();
  await db.insert(schema.contacts).values({
    id: contactId,
    workspaceId: workspaceId,
    ownerId: salesAgentId, // Owned by Sales Agent
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    companyName: 'Acme Corp',
    sourceChannel: 'Web',
    tags: ['VIP', 'Tech'],
    metadata: { linkedin: 'https://linkedin.com/in/johndoe' },
  });

  const leadId = uuidv4();
  await db.insert(schema.leads).values({
    id: leadId,
    workspaceId: workspaceId,
    ownerId: salesAgentId,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    sourceChannel: 'Web',
    notes: 'Very interested in our tech stack.',
  });

  await db.insert(schema.deals).values({
    id: uuidv4(),
    workspaceId: workspaceId,
    ownerId: salesAgentId,
    leadId: leadId,
    title: 'Enterprise License',
    value: '50000.00',
    probability: 60,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  console.log('✅ Seeded CRM data linked to specific users');
  console.log('🚀 Hierarchy seeding completed successfully!');
  
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
