use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Manager, PhysicalPosition, WebviewUrl, WebviewWindowBuilder};

const APERTURE_LOGICAL_SIZE: f64 = 150.0;
const POLL_INTERVAL_MS: u64 = 16; // ~60fps

static APERTURE_RUNNING: AtomicBool = AtomicBool::new(false);
static APERTURE_DISABLED: AtomicBool = AtomicBool::new(false);

// ---------------------------------------------------------------------------
// Platform-specific cursor position
// ---------------------------------------------------------------------------

#[cfg(target_os = "macos")]
fn get_cursor_position() -> (f64, f64) {
    use core_graphics::event::{CGEvent, CGEventTapLocation};
    match CGEvent::new(CGEventTapLocation::HID) {
        Some(event) => {
            let location = event.location();
            (location.x, location.y)
        }
        None => (0.0, 0.0),
    }
}

#[cfg(windows)]
fn get_cursor_position() -> (f64, f64) {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;
    let mut point = POINT { x: 0, y: 0 };
    let _ = unsafe { GetCursorPos(&mut point) };
    (point.x as f64, point.y as f64)
}

#[cfg(target_os = "linux")]
fn get_cursor_position(display: *mut x11::xlib::Display, root: x11::xlib::Window) -> (f64, f64) {
    unsafe {
        let mut root_return: x11::xlib::Window = 0;
        let mut child_return: x11::xlib::Window = 0;
        let mut root_x: i32 = 0;
        let mut root_y: i32 = 0;
        let mut win_x: i32 = 0;
        let mut win_y: i32 = 0;
        let mut mask_return: u32 = 0;

        x11::xlib::XQueryPointer(
            display,
            root,
            &mut root_return,
            &mut child_return,
            &mut root_x,
            &mut root_y,
            &mut win_x,
            &mut win_y,
            &mut mask_return,
        );

        (root_x as f64, root_y as f64)
    }
}

// ---------------------------------------------------------------------------
// Window creation
// ---------------------------------------------------------------------------

pub fn create_aperture(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Close existing aperture window if any
    if let Some(existing) = app.get_webview_window("aperture") {
        let _ = existing.close();
    }

    let window = WebviewWindowBuilder::new(
        app,
        "aperture",
        WebviewUrl::App("/aperture.html".into()),
    )
    .title("aperture")
    .inner_size(APERTURE_LOGICAL_SIZE, APERTURE_LOGICAL_SIZE)
    .decorations(false)
    .always_on_top(true)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(true)
    .visible_on_all_workspaces(true)
    .resizable(false)
    .visible(false)
    .build()?;

    configure_aperture_window(&window);

    window.show()?;
    println!("Aperture window created");

    Ok(())
}

#[cfg(target_os = "macos")]
fn configure_aperture_window(window: &tauri::WebviewWindow) {
    use cocoa::appkit::{NSColor, NSWindow};
    use cocoa::base::{id, nil, YES};

    if let Ok(ns_window) = window.ns_window() {
        unsafe {
            let ns_window = ns_window as id;
            let clear_color: id = NSColor::clearColor(nil);
            ns_window.setBackgroundColor_(clear_color);
            ns_window.setOpaque_(cocoa::base::NO);
            ns_window.setHasShadow_(cocoa::base::NO);
            ns_window.setIgnoresMouseEvents_(YES);
        }
    }
}

#[cfg(windows)]
fn configure_aperture_window(window: &tauri::WebviewWindow) {
    let _ = window.set_ignore_cursor_events(true);
}

#[cfg(target_os = "linux")]
fn configure_aperture_window(window: &tauri::WebviewWindow) {
    let _ = window.set_ignore_cursor_events(true);
}

// ---------------------------------------------------------------------------
// Cursor polling thread
// ---------------------------------------------------------------------------

pub fn start_cursor_polling(app_handle: AppHandle) {
    if APERTURE_RUNNING.swap(true, Ordering::SeqCst) {
        return; // Already running
    }

    #[cfg(target_os = "linux")]
    let x11_display = unsafe {
        let display = x11::xlib::XOpenDisplay(std::ptr::null());
        if display.is_null() {
            eprintln!("Failed to open X11 display for aperture");
            APERTURE_RUNNING.store(false, Ordering::SeqCst);
            return;
        }
        let root = x11::xlib::XDefaultRootWindow(display);
        (display, root)
    };

    thread::spawn(move || {
        loop {
            if !APERTURE_RUNNING.load(Ordering::SeqCst) {
                break;
            }

            #[cfg(not(target_os = "linux"))]
            let (cx, cy) = get_cursor_position();

            #[cfg(target_os = "linux")]
            let (cx, cy) = get_cursor_position(x11_display.0, x11_display.1);

            if let Some(window) = app_handle.get_webview_window("aperture") {
                if let Ok(size) = window.inner_size() {
                    let x = cx - size.width as f64 / 2.0;
                    let y = cy - size.height as f64 / 2.0;
                    let _ = window.set_position(PhysicalPosition::new(x, y));
                }
            }

            std::thread::sleep(Duration::from_millis(POLL_INTERVAL_MS));
        }

        #[cfg(target_os = "linux")]
        unsafe {
            x11::xlib::XCloseDisplay(x11_display.0);
        }
    });

    println!("Aperture cursor polling started");
}

pub fn stop_cursor_polling() {
    APERTURE_RUNNING.store(false, Ordering::SeqCst);
}

pub fn set_aperture_disabled(disabled: bool) {
    APERTURE_DISABLED.store(disabled, Ordering::SeqCst);
}

pub fn destroy_aperture(app: &AppHandle) {
    APERTURE_DISABLED.store(true, Ordering::SeqCst);
    stop_cursor_polling();
    if let Some(window) = app.get_webview_window("aperture") {
        let _ = window.close();
    }
    println!("Aperture destroyed");
}

pub fn refresh_aperture(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if APERTURE_DISABLED.load(Ordering::SeqCst) {
        return Ok(());
    }
    if app.get_webview_window("aperture").is_none() {
        create_aperture(app)?;
        start_cursor_polling(app.clone());
    }
    Ok(())
}
