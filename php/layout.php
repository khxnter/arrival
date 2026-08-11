<?php
require_once __DIR__ . '/config.php';
// Expects $title, $body_class, $content to be set by the calling page.
?>
<!DOCTYPE html>
<html>
<?php include __DIR__ . '/includes/head.php'; ?>
<body class="<?php echo isset($body_class) ? htmlspecialchars($body_class) : ''; ?>">

  <?php include __DIR__ . '/includes/header.php'; ?>

  <main>
    <div class="container">
      <?php echo $content; ?>
    </div>
  </main>

  <?php include __DIR__ . '/includes/footer.php'; ?>

</body>
</html>
