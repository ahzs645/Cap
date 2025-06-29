#[derive(Clone, Copy)]
pub struct DisplayImpl {
    pub id: u32,
}

impl DisplayImpl {
    pub fn list() -> Vec<Self> {
        // For now, return a single default display
        // In a full implementation, this would use X11 or Wayland APIs
        vec![Self { id: 0 }]
    }

    pub fn primary() -> Self {
        Self { id: 0 }
    }

    pub fn id(&self) -> u32 {
        self.id
    }
}