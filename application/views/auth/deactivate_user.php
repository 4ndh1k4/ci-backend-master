
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        <?php echo lang('deactivate_heading');?>
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
		 </div> '; 
    }  ?>
      <!-- Default box -->
      <div class="box">
        <div class="box-header">
		 <h3 class="box-title"><?php echo sprintf(lang('deactivate_subheading'), $user->username);?></h3>
		<hr />	 
		<?php echo form_open("auth/deactivate/".$user->id);?>

		  <p>
			<?php echo lang('deactivate_confirm_y_label', 'confirm');?>
			<input type="radio" name="confirm" value="yes" checked="checked" />
			<?php echo lang('deactivate_confirm_n_label', 'confirm');?>
			<input type="radio" name="confirm" value="no" />
		  </p>

		  <?php echo form_hidden($csrf); ?>
		  <?php echo form_hidden(array('id'=>$user->id)); ?>

		  <?php echo form_submit('submit', lang('deactivate_submit_btn'),array('class'=>'btn btn-primary btn-flat'));?>
	    <a href="<?php echo site_url('auth/index') ?>" class="btn btn-flat btn-default">Batal</a>
	<?php echo form_close();?>
		</div>
		</div>
               
    </section>
	<!-- /.content -->