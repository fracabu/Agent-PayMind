# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PayMind is an AI-powered payment reminder system that uses Claude Code agents to automate invoice collection workflows. The system operates entirely through CLI agents - there is no Python code or web application.

## Architecture

The system consists of three specialized Claude Code agents defined in `.claude/agents/`:

1. **payment-monitor-agent** - Analyzes CSV invoice files, identifies overdue/upcoming invoices, calculates days late, and segments by priority (ALTA/MEDIA/BASSA)

2. **reminder-generator-agent** - Generates personalized reminder messages adapted for each channel (Email, SMS, WhatsApp) with appropriate tone based on priority and days overdue

3. **response-handler-agent** - Analyzes customer responses, identifies intent (payment_confirmed, dispute, request_delay, etc.), performs sentiment analysis, and suggests follow-up actions

## Agent Usage

Invoke agents from Claude Code CLI:

```bash
# Analyze invoices
"payment-monitor-agent: analizza invoices.csv e dammi report"

# Generate reminder message
"reminder-generator-agent: genera email per FAT-2025-001"

# Analyze customer response
"response-handler-agent: analizza questa risposta: [paste text]"
```

## CSV Invoice Format

Required columns in invoice CSV files:
- `invoice_id` - Unique identifier (e.g., FAT-2025-001)
- `customer_name` - Company/customer name
- `amount_total` - Total invoice amount
- `amount_paid` - Amount already paid
- `due_date` - Due date (YYYY-MM-DD)
- `status` - open, paid, or disputed
- `preferred_channel` - email, sms, or whatsapp
- `customer_email` - Customer email address
- `customer_phone` - Phone with international prefix

## Output Files

Agents generate text files in the project root:
- `email_*.txt` - Generated email messages
- `reminder_*.txt` - Other reminder messages
- `response_analysis_*.txt` - Response analysis reports

These output files are excluded from git via `.gitignore`.

## Language

The system is designed for Italian business communications. Agent prompts, generated messages, and documentation use Italian.
