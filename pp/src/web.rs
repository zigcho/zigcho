use std::slice;

#[unsafe(no_mangle)]
pub extern "C" fn zigcho_pp_alloc(bytes: usize) -> *mut u8 {
    if bytes == 0 || bytes > 32 * 1024 * 1024 {
        return std::ptr::null_mut();
    }
    let buffer = vec![0u64; bytes.div_ceil(8)].into_boxed_slice();
    Box::into_raw(buffer) as *mut u8
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn zigcho_pp_free(pointer: *mut u8, bytes: usize) {
    if !pointer.is_null() && bytes > 0 && bytes <= 32 * 1024 * 1024 {
        let buffer = unsafe { slice::from_raw_parts_mut(pointer.cast::<u64>(), bytes.div_ceil(8)) };
        unsafe { drop(Box::from_raw(buffer)) };
    }
}
