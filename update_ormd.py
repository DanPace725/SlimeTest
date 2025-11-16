#!/usr/bin/env python3
"""Update existing markdown files to use ORMD schema"""

import os
import re
from pathlib import Path
from datetime import datetime

# Files that have already been updated
ALREADY_UPDATED = {
    '/workspaces/EssenceEngine/docs/INDEX.md',
    '/workspaces/EssenceEngine/docs/architecture/README.md',
    '/workspaces/EssenceEngine/docs/how-to/README.md',
    '/workspaces/EssenceEngine/docs/architecture/TECHNICAL_DOC.md',
    '/workspaces/EssenceEngine/docs/how-to/TRAINING_GUIDE.md',
    '/workspaces/EssenceEngine/docs/ormd_schema.md',  # Skip the schema itself
}

# Archive and TC docs - skip these
SKIP_PATTERNS = {
    '/workspaces/EssenceEngine/docs/archive/',
}

def extract_title_from_filename(filename):
    """Extract title from filename"""
    name = Path(filename).stem
    # Convert UPPER_CASE_WITH_UNDERSCORES to Title Case
    title = name.replace('_', ' ').title()
    return title

def extract_title_from_content(content):
    """Extract title from first markdown heading"""
    lines = content.split('\n')
    for line in lines:
        if line.startswith('# '):
            return line[2:].strip()
    return None

def generate_ormd_header(filepath, title=None):
    """Generate ORMD header with YAML front matter"""
    filename = os.path.basename(filepath)
    
    # Extract title from content or filename
    if not title:
        title = extract_title_from_filename(filename)
    
    # Sanitize title (remove emojis and excessive punctuation)
    title = re.sub(r'[^\w\s\-:().]', '', title).strip()
    
    # Determine status based on filename
    status = "complete"
    if "TODO" in filename or "WIP" in filename:
        status = "in-progress"
    elif "DRAFT" in filename:
        status = "draft"
    
    timestamp = datetime.now().isoformat() + 'Z'
    
    header = f"""<!-- ormd:0.1 -->
---
title: "{title}"
authors: ["Emergence Engine Team"]
dates:
  created: '{timestamp}'
links: []
status: "{status}"
description: "Emergence Engine documentation"
---
"""
    return header

def has_ormd_header(content):
    """Check if content already has ORMD header"""
    return content.startswith('<!-- ormd:')

def update_file(filepath):
    """Update a single file with ORMD header"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has ORMD header
        if has_ormd_header(content):
            print(f"⏭️  SKIP (already updated): {filepath}")
            return False
        
        # Extract title from first heading
        title = extract_title_from_content(content)
        
        # Generate header
        header = generate_ormd_header(filepath, title)
        
        # Combine header and content
        new_content = header + '\n' + content
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ UPDATED: {filepath}")
        return True
    except Exception as e:
        print(f"❌ ERROR: {filepath} - {str(e)}")
        return False

def main():
    """Update all markdown files in docs directory"""
    docs_dir = '/workspaces/EssenceEngine/docs'
    updated_count = 0
    skipped_count = 0
    
    # Find all markdown files
    md_files = list(Path(docs_dir).rglob('*.md'))
    
    print(f"Found {len(md_files)} markdown files")
    print("=" * 60)
    
    for md_file in sorted(md_files):
        filepath = str(md_file)
        
        # Skip already updated files
        if filepath in ALREADY_UPDATED:
            print(f"⏭️  SKIP (already processed): {filepath}")
            skipped_count += 1
            continue
        
        # Skip archive files
        skip = False
        for pattern in SKIP_PATTERNS:
            if pattern in filepath:
                print(f"⏭️  SKIP (archive/tc): {filepath}")
                skip = True
                skipped_count += 1
                break
        
        if skip:
            continue
        
        if update_file(filepath):
            updated_count += 1
        else:
            skipped_count += 1
    
    print("=" * 60)
    print(f"✅ Updated: {updated_count} files")
    print(f"⏭️  Skipped: {skipped_count} files")

if __name__ == '__main__':
    main()
