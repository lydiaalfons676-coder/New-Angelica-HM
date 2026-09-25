from pathlib import Path
import re

root = Path(r'c:\Users\compuremo\Desktop\New Angelica HM - Copy (2)')

# Canonical reviews inner (from bag1.html) - 3 cards Mary/Sara/Lina
REVIEWS_INNER = '''<div class="reviews">

    <div class="review-card">
        <h4>⭐⭐⭐⭐⭐ Mary</h4>
        <p>Beautiful bag and amazing quality ❤️</p>
    </div>

    <div class="review-card">
        <h4>⭐⭐⭐⭐⭐ Sara</h4>
        <p>Very elegant and exactly like the pictures.</p>
    </div>

    <div class="review-card">
        <h4>⭐⭐⭐⭐⭐ Lina</h4>
        <p>Fast shipping and beautiful packaging.</p>
    </div>

</div>'''

REVIEW_BLOCK_TEMPLATE = '''<!-- هنا اكتبي كود Reviews -->

<hr>

<h3>⭐ Customer Reviews</h3>

''' + REVIEWS_INNER

def find_matching_div_end(text, div_start_idx):
    """Given index of '<div', find index END (after matching '</div>') by counting."""
    # find end of opening tag '>'
    open_end = text.find('>', div_start_idx)
    if open_end == -1:
        raise ValueError('no > for div')
    depth = 1
    pos = open_end + 1
    pat = re.compile(r'<div\b|</div\s*>', re.IGNORECASE)
    for m in pat.finditer(text, pos):
        tok = m.group(0).lower()
        if tok.startswith('<div'):
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                return m.end()  # end after </div>
    raise ValueError('no matching </div>')

def extract_related(text):
    h3 = '<h3>👜 Related Products</h3>'
    i = text.find(h3)
    if i == -1:
        return None, None, None
    end_comment = '<!-- نهاية related-products -->'
    j = text.find(end_comment, i)
    if j == -1:
        raise ValueError('related end comment not found')
    j_end = j + len(end_comment)
    block = text[i:j_end]
    return block, i, j_end

def extract_reviews(text):
    h3 = '<h3>⭐ Customer Reviews</h3>'
    i = text.find(h3)
    if i == -1:
        return None, None, None
    # include preceding <hr> and comment if present
    start = i
    # look back up to 500 chars for <hr> then optional comment
    back = text[max(0, i-600):i]
    # find last <hr> in back
    m = list(re.finditer(r'<hr\s*/?>', back, re.IGNORECASE))
    if m:
        start = max(0, i-600) + m[-1].start()
        # include comment before hr if exists within 300 chars
        cback = text[max(0, start-400):start]
        cm = list(re.finditer(r'<!--\s*هنا اكتبي كود Reviews\s*-->', cback))
        if cm:
            start = max(0, start-400) + cm[-1].start()
    div_start = text.find('<div class="reviews">', i)
    if div_start == -1:
        # fallback: <div class="reviews"> with extra spaces
        mm = re.search(r'<div\s+class="reviews">', text[i:])
        if not mm:
            raise ValueError('reviews div not found')
        div_start = i + mm.start()
    div_end = find_matching_div_end(text, div_start)
    block = text[start:div_end]
    return block, start, div_end

bag_nums = list(range(1, 7)) + list(range(8, 37)) + list(range(38, 63))
targets = [f'bag{n}.html' for n in bag_nums] + ['product.html']

updated = 0
for fname in targets:
    p = root / fname
    if not p.exists():
        print(f'SKIP missing {fname}')
        continue
    text = p.read_text(encoding='utf-8')

    rel_block, rel_s, rel_e = extract_related(text)
    if rel_block is None:
        print(f'FAIL {fname}: no related found')
        continue

    rev_block, rev_s, rev_e = extract_reviews(text)

    # Remove related + reviews (+ preceding <hr> before related) from original location
    # Build removal spans
    spans = []
    # related span: extend back to include preceding <hr> if directly before
    rel_span_s = rel_s
    back2 = text[max(0, rel_s-400):rel_s]
    m2 = list(re.finditer(r'<hr\s*/?>', back2, re.IGNORECASE))
    if m2:
        # only take hr if only whitespace between hr end and rel_s
        hr_abs_s = max(0, rel_s-400) + m2[-1].start()
        hr_abs_e = max(0, rel_s-400) + m2[-1].end()
        between = text[hr_abs_e:rel_s]
        if between.strip() == '':
            rel_span_s = hr_abs_s
    spans.append((rel_span_s, rel_e))
    if rev_block is not None:
        spans.append((rev_s, rev_e))

    # remove spans from last to first
    for s, e in sorted(spans, reverse=True):
        text = text[:s] + text[e:]

    # Now find popup end for insertion
    pop_start = text.find('<div id="order-popup"')
    if pop_start == -1:
        print(f'FAIL {fname}: no order-popup')
        continue
    pop_end = find_matching_div_end(text, pop_start)

    # From pop_end onwards, strip existing closing divs / hrs / whitespace up to <script
    script_idx = text.find('<script', pop_end)
    if script_idx == -1:
        print(f'FAIL {fname}: no script tag')
        continue
    middle = text[pop_end:script_idx]
    # middle should be closings + whitespace; we will discard div/hr-only middle
    # sanity: middle must not contain meaningful content besides div/hr
    stripped_check = re.sub(r'</?div[^>]*>', '', middle)
    stripped_check = re.sub(r'<hr\s*/?>', '', stripped_check)
    if stripped_check.strip() != '':
        print(f'WARN {fname}: unexpected content between popup and script: {repr(stripped_check.strip()[:120])} — will still normalize')

    # Build new inner block: <hr> + related (trimmed) + reviews template + closes
    rel_clean = rel_block.strip()
    new_inner = '\n<hr>\n\n' + rel_clean + '\n\n' + REVIEW_BLOCK_TEMPLATE + '\n\n        </div>\n    </div>\n\n    '
    new_text = text[:pop_end] + new_inner + text[script_idx:]
    # fix: ensure product-details/product-page properly closed (we added 2 closes)
    p.write_text(new_text, encoding='utf-8')
    updated += 1
    has_rev = 'had-reviews' if rev_block else 'added-reviews'
    print(f'{fname}: moved-related-inside + {has_rev}')

print(f'Done. Updated: {updated}/{len(targets)}')
