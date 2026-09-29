const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain';

const chats = [
  {
    id: '49e72712-4f25-4f58-963d-9229d5b22fe8',
    role: 'Thread 1: Primary Builder & Orchestrator',
    description: 'Responsible for core implementation, Next.js architecture, state management, deterministic constraint solver, TDD test suite (41 tests), and UI/UX design.'
  },
  {
    id: '3c0c2024-fee1-40e4-8ec6-9f8d613b1408',
    role: 'Thread 2: Lead Researcher & Systems Architect',
    description: 'Responsible for raw seed data audit, 5-variant dropout string normalization, causal loop modeling, metric hierarchies, ProMan resource synthesis, and production PRD drafting.'
  },
  {
    id: 'b4c06116-2e9e-4419-80be-7931b294fffb',
    role: 'Thread 3: Principal Code Reviewer & Evaluator',
    description: 'Responsible for adversarial verification, test coverage enforcement, confidence-based code review, security audits, and scoring against the hiring evaluation rubric.'
  }
];

function extractTurns(conversationId) {
  const fullPath = path.join(brainDir, conversationId, '.system_generated', 'logs', 'transcript_full.jsonl');
  const shortPath = path.join(brainDir, conversationId, '.system_generated', 'logs', 'transcript.jsonl');
  const target = fs.existsSync(fullPath) ? fullPath : shortPath;
  if (!fs.existsSync(target)) return [];

  const lines = fs.readFileSync(target, 'utf-8').trim().split('\n');
  const turns = [];
  let currentTurn = null;

  for (const line of lines) {
    if (!line) continue;
    try {
      const d = JSON.parse(line);
      if (d.type === 'USER_INPUT') {
        let content = d.content || '';
        if (content.startsWith('# Resuming from a compaction') || content.includes('<CONTEXT_SUMMARY>')) {
          continue;
        }
        content = content.replace(/<USER_REQUEST>/g, '').replace(/<\/USER_REQUEST>/g, '').trim();
        // Remove additional metadata boilerplate if present
        content = content.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '').trim();
        content = content.replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, '').trim();

        if (currentTurn) {
          turns.push(currentTurn);
        }
        currentTurn = {
          prompt: content,
          responses: []
        };
      } else if (d.type === 'PLANNER_RESPONSE' && d.content && d.content.trim()) {
        if (currentTurn) {
          currentTurn.responses.push(d.content.trim());
        }
      }
    } catch (e) {}
  }

  if (currentTurn) {
    turns.push(currentTurn);
  }

  return turns;
}

let md = `# TiffinLoop — Complete AI Agent Multi-Thread Build Log

> **Assignment:** StampMyVisa AI Product Manager Hiring Assignment  
> **Requirement 4:** Full prompt history AND the AI's responses demonstrating how the APM directed the tools, what was accepted, and what was corrected.  
> **Methodology:** Everything Claude Code (ECC) Agent Operating System  
> **Multi-Agent Architecture:** 3 Specialized Concurrent Threads (Orchestrator/Builder, Researcher, Reviewer)  

---

## Multi-Agent Architecture Overview

To build production-grade software under strict hiring constraints, the candidate deployed an **agentic pairing architecture** utilizing the Everything Claude Code (ECC) lifecycle across three concurrent specialized sessions:

1. **Thread 1: Primary Builder & Orchestrator** (\`49e72712-4f25-4f58-963d-9229d5b22fe8\`)
   - Executes architectural implementation, state management, in-memory MRV heuristic solver, widescreen UI polish, and 41 Vitest automated unit/integration tests.
2. **Thread 2: Lead Researcher & Systems Architect** (\`3c0c2024-fee1-40e4-8ec6-9f8d613b1408\`)
   - Performs seed data analytics on 7,138 orders, extracts the 5 dropout string variations, applies Teresa Torres/Oleh Shulimov metric frameworks, models causal loops, and synthesizes product documentation.
3. **Thread 3: Principal Code Reviewer & Evaluator** (\`b4c06116-2e9e-4419-80be-7931b294fffb\`)
   - Acts as an adversarial hiring evaluator, checks code quality and security boundaries, enforces the $\\ge 80\\%$ test coverage bar, and validates edge cases (e.g. strict Jain diet allocation, entity deduplication).

---

`;

chats.forEach((chat, idx) => {
  const turns = extractTurns(chat.id);
  md += `\n# PART ${idx + 1}: ${chat.role}\n\n`;
  md += `**Role:** ${chat.description}  \n`;
  md += `**Conversation ID:** \`${chat.id}\`  \n`;
  md += `**Total Interaction Turns:** ${turns.length}  \n\n`;
  md += `---\n\n`;

  turns.forEach((t, tIdx) => {
    md += `### [${chat.role.split(':')[0]}] Turn ${tIdx + 1}: Product Manager\n\n`;
    md += `${t.prompt}\n\n`;

    if (t.responses.length > 0) {
      md += `#### AI Agent Response\n\n`;
      t.responses.forEach(resp => {
        md += `${resp}\n\n`;
      });
    } else {
      md += `*Note: Action executed or turn completed.*\n\n`;
    }
    md += `---\n\n`;
  });
});

const outPath = path.join(__dirname, '..', 'docs', 'BUILD_LOG.md');
fs.writeFileSync(outPath, md, 'utf-8');
const stats = fs.statSync(outPath);
console.log(`Successfully generated master build log: ${outPath}`);
console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
