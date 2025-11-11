// TC Overlay Debug Test
// Run this in browser console to diagnose overlay issues

(async () => {
  console.log('=== TC Overlay Diagnostic ===\n');
  
  // Step 1: Check CONFIG
  const { CONFIG } = await import('../../src/runtime/config.js');
  console.log('1. CONFIG.tcResourceIntegration:');
  console.log('   - enabled:', CONFIG.tcResourceIntegration?.enabled);
  console.log('   - showOverlay:', CONFIG.tcResourceIntegration?.showOverlay);
  console.log('   - overlayOpacity:', CONFIG.tcResourceIntegration?.overlayOpacity);
  console.log('   - overlayHeight:', CONFIG.tcResourceIntegration?.overlayHeight);
  console.log('   - overlayPosition:', CONFIG.tcResourceIntegration?.overlayPosition);
  
  // Step 2: Check TC enabled
  console.log('\n2. TC System:');
  console.log('   - CONFIG.tc.enabled:', CONFIG.tc?.enabled);
  console.log('   - CONFIG.tc.updateCadence:', CONFIG.tc?.updateCadence);
  
  // Step 3: Check stepper
  console.log('\n3. Rule 110 Stepper:');
  console.log('   - window.rule110Stepper exists:', !!window.rule110Stepper);
  if (window.rule110Stepper) {
    try {
      const state = window.rule110Stepper.getState();
      console.log('   - State length:', state?.length);
      const active = state ? Array.from(state).filter(c => c === 1).length : 0;
      console.log('   - Active cells:', active, '/', state?.length);
      console.log('   - Activity:', ((active / state.length) * 100).toFixed(1) + '%');
    } catch (err) {
      console.log('   - Error getting state:', err.message);
    }
  }
  
  // Step 4: Check canvas
  console.log('\n4. Canvas:');
  const canvas = document.getElementById('view');
  console.log('   - Canvas exists:', !!canvas);
  if (canvas) {
    console.log('   - Canvas size:', canvas.width, 'x', canvas.height);
    console.log('   - Canvas display:', window.getComputedStyle(canvas).display);
  }
  
  // Step 5: Check if overlay function exists
  console.log('\n5. Overlay Function:');
  try {
    const { drawRule110Overlay } = await import('../../src/runtime/tcResourceBridge.js');
    console.log('   - drawRule110Overlay imported:', !!drawRule110Overlay);
    
    // Try to call it with test parameters
    if (canvas && window.rule110Stepper) {
      const ctx = canvas.getContext('2d');
      console.log('   - Attempting manual overlay draw...');
      drawRule110Overlay(ctx, window.rule110Stepper, canvas.width, canvas.height);
      console.log('   - ✅ Manual draw completed (check canvas!)');
    }
  } catch (err) {
    console.log('   - Error:', err.message);
  }
  
  // Step 6: Recommendations
  console.log('\n=== Recommendations ===');
  
  if (!CONFIG.tc?.enabled) {
    console.log('⚠️  TC not enabled. Run: enableTC("rule110")');
  }
  
  if (!window.rule110Stepper) {
    console.log('⚠️  No stepper registered. Run:');
    console.log('   const { registerRule110Stepper } = await import("../../tc/tcRule110.js");');
    console.log('   const { stepper } = registerRule110Stepper({ width: 128, initializer: "ether" });');
    console.log('   window.rule110Stepper = stepper;');
  }
  
  if (!CONFIG.tcResourceIntegration?.enabled) {
    console.log('⚠️  TC-Resource integration disabled. Run:');
    console.log('   CONFIG.tcResourceIntegration.enabled = true;');
  }
  
  if (!CONFIG.tcResourceIntegration?.showOverlay) {
    console.log('⚠️  Overlay disabled. Run:');
    console.log('   CONFIG.tcResourceIntegration.showOverlay = true;');
  }
  
  if (CONFIG.tcResourceIntegration?.overlayOpacity < 0.2) {
    console.log('⚠️  Overlay might be too faint. Try:');
    console.log('   CONFIG.tcResourceIntegration.overlayOpacity = 0.5;');
  }
  
  console.log('\n=== End Diagnostic ===');
})();

