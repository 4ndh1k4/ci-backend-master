
   <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>        
        <small></small>
      </h1>
      <ol class="breadcrumb">
        <li><?php echo anchor('dashboard','<i class="fa fa-dashboard"></i> Beranda</a>')?></li>
      </ol>
    </section>
    <!-- Main content -->
    <section class="content">
	<?php if(isset($message)){   
		 echo '<div class="alert alert-warning">  
		   <a href="#" class="close" data-dismiss="alert">&times;</a>  
		   '.$message.'
		 </div>';
    }  ?>
   
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title">Detail Menu</h3>
		<hr />
        <table class="table">
	    <tr><td>Parent Menu</td><td><?php echo $parent_menu; ?></td></tr>
	    <tr><td>Nama Menu</td><td><?php echo $nama_menu; ?></td></tr>
	    <tr><td>Controller Link</td><td><?php echo $controller_link; ?></td></tr>
	    <tr><td>Icon</td><td><?php echo $icon; ?></td></tr>
	    <tr><td>Slug</td><td><?php echo $slug; ?></td></tr>
	    <tr><td>Urut Menu</td><td><?php echo $urut_menu; ?></td></tr>
	    <tr><td>Menu Users</td><td><?php echo $menu_grup_user; ?></td></tr>
	    <tr><td>Is Active</td><td><?php echo $is_active; ?></td></tr>
	    <tr><td></td><td><a href="<?php echo site_url('menu') ?>" class="btn btn-flat btn-default">Batal</a></td></tr>
	</table>
        </div>
	 </div>
               
    </section>
	<!-- /.content -->
